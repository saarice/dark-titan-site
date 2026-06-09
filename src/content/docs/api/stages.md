# API: Stages

The stages endpoints expose per-stage status, iteration counts, and gate evaluation history for a flow run. The gate-override endpoint is used to submit manual gate decisions for stages configured with `gate_type: manual`.

## GET /api/v1/flows/{flowID}/stages

List all stages for a flow run with their current status, iteration count, and latest gate decision. This is useful for a quick overview of where a flow is in its execution.

**Request**

```bash
curl http://localhost:7700/api/v1/flows/run-a1b2c3d4/stages
```

**Response — 200 OK**

```json
[
  {
    "name": "implement",
    "status": "COMPLETED",
    "iteration": 2,
    "gate_type": "ai-evaluation",
    "gate_decision": "PASS",
    "started_at": "2026-03-23T14:01:00Z",
    "completed_at": "2026-03-23T14:06:02Z"
  },
  {
    "name": "review",
    "status": "RUNNING",
    "iteration": 1,
    "gate_type": "ai-evaluation",
    "gate_decision": null,
    "started_at": "2026-03-23T14:06:03Z",
    "completed_at": null
  },
  {
    "name": "test",
    "status": "PENDING",
    "iteration": 0,
    "gate_type": "test-results",
    "gate_decision": null,
    "started_at": null,
    "completed_at": null
  }
]
```

### Stage status values

| Status | Description |
|---|---|
| `PENDING` | Stage has not started yet |
| `RUNNING` | Agent is currently executing for this stage |
| `AWAITING_GATE` | Agent finished; waiting for manual gate-override submission |
| `LOOPING` | Gate failed and the stage is looping |
| `ESCALATED` | max_iterations exhausted; escalation policy fired |
| `COMPLETED` | Gate passed; stage finished successfully |
| `SKIPPED` | Stage was skipped (e.g. flow was stopped before reaching this stage) |

## GET /api/v1/flows/{flowID}/stages/{stageID}

Get detailed information about a specific stage, including the full history of every gate evaluation with its decision and rationale.

**Request**

```bash
curl http://localhost:7700/api/v1/flows/run-a1b2c3d4/stages/implement
```

**Response — 200 OK**

```json
{
  "name": "implement",
  "status": "COMPLETED",
  "iteration": 2,
  "max_iterations": 5,
  "gate_type": "ai-evaluation",
  "escalation": "ai-decide",
  "loop_target_stage": "",
  "started_at": "2026-03-23T14:01:00Z",
  "completed_at": "2026-03-23T14:06:02Z",
  "gate_evaluations": [
    {
      "iteration": 1,
      "decision": "FAIL",
      "rationale": "Tests still failing: TestHandleCreate expects status 201, got 200.",
      "evaluated_at": "2026-03-23T14:03:23Z"
    },
    {
      "iteration": 2,
      "decision": "PASS",
      "rationale": "All tests pass. Implementation matches the spec in TASK.md.",
      "evaluated_at": "2026-03-23T14:06:02Z"
    }
  ]
}
```

The `gate_evaluations` array contains one entry per iteration that completed a gate evaluation. Use this to understand exactly why a stage looped and what the agent fixed between iterations.

## POST /api/v1/flows/{flowID}/stages/{stageID}/gate-override

Submit a manual gate decision for a stage with `gate_type: manual`. The flow must be in `AWAITING_GATE` status for the specified stage for this endpoint to succeed.

**Submitting PASS**

```bash
curl -X POST http://localhost:7700/api/v1/flows/run-a1b2c3d4/stages/security-review/gate-override \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "PASS",
    "rationale": "Reviewed SECURITY-REVIEW.md — no blocking issues. Minor suggestion filed as a follow-up ticket."
  }'
```

**Response — 200 OK**

```json
{
  "ok": true,
  "stage": "security-review",
  "decision": "PASS",
  "recorded_at": "2026-03-23T15:30:00Z"
}
```

To fail the gate and trigger a loop (or escalation if iterations are exhausted):

**Submitting FAIL**

```bash
curl -X POST http://localhost:7700/api/v1/flows/run-a1b2c3d4/stages/security-review/gate-override \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "FAIL",
    "rationale": "SQL injection risk found in search handler — see SECURITY-REVIEW.md line 42. Must be fixed before proceeding."
  }'
```

| Field | Required | Description |
|---|---|---|
| `decision` | Yes | `PASS` or `FAIL` |
| `rationale` | Yes | Human-readable explanation. Stored in the gate evaluation history and fed back to the agent on a FAIL loop so it knows what to address. |

> **Note:** Write a specific rationale when submitting FAIL — the agent receives this text verbatim as context for its next iteration. A rationale like "SQL injection risk in search handler — see SECURITY-REVIEW.md line 42" gives the agent a precise target; a rationale like "needs work" does not.
