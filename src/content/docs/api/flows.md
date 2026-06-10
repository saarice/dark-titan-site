# API: Flows

The flows endpoints let you start flow runs, list existing runs, control execution (pause, resume, stop), and subscribe to real-time events via SSE.

## POST /api/v1/flows/run

Start a new flow run. Provide the `flow_id` of the saved flow definition and the `local_dir` that the agents should operate on.

**Request**

```bash
curl -X POST http://localhost:7700/api/v1/flows/run \
  -H "Content-Type: application/json" \
  -d '{
    "flow_id": "f1a2b3c4-5678-90ab-cdef-111213141516",
    "local_dir": "/Users/alice/projects/my-app"
  }'
```

| Field | Required | Description |
|---|---|---|
| `flow_id` | Yes | UUID of the saved flow definition to run |
| `local_dir` | Yes | Absolute path to the project directory agents will read and write |

**Response — 200 OK**

```json
{
  "id": "run-a1b2c3d4",
  "flow_id": "f1a2b3c4-5678-90ab-cdef-111213141516",
  "status": "RUNNING",
  "local_dir": "/Users/alice/projects/my-app",
  "started_at": "2026-03-23T14:01:00Z",
  "completed_at": null,
  "current_stage": "implement",
  "stages": [
    {"name": "implement", "status": "RUNNING", "iteration": 1},
    {"name": "review", "status": "PENDING", "iteration": 0},
    {"name": "test", "status": "PENDING", "iteration": 0}
  ]
}
```

## GET /api/v1/flows

List all flow runs, including completed, failed, and currently running runs.

**Request**

```bash
curl http://localhost:7700/api/v1/flows
```

**Response — 200 OK**

```json
[
  {
    "id": "run-a1b2c3d4",
    "flow_id": "f1a2b3c4-5678-90ab-cdef-111213141516",
    "status": "COMPLETED",
    "local_dir": "/Users/alice/projects/my-app",
    "started_at": "2026-03-23T14:01:00Z",
    "completed_at": "2026-03-23T14:09:47Z"
  },
  {
    "id": "run-e5f6a7b8",
    "flow_id": "f1a2b3c4-5678-90ab-cdef-111213141516",
    "status": "RUNNING",
    "local_dir": "/Users/alice/projects/my-app",
    "started_at": "2026-03-23T15:00:00Z",
    "completed_at": null
  }
]
```

### Flow status values

| Status | Description |
|---|---|
| `RUNNING` | Flow is actively executing |
| `PAUSED` | Flow has been paused (manually or by escalation) |
| `AWAITING_GATE` | A manual gate is waiting for a gate-override submission |
| `COMPLETED` | All stages passed — flow finished successfully |
| `FAILED` | Flow was aborted or encountered an unrecoverable error |
| `STOPPED` | Flow was manually stopped via the stop endpoint |

## POST /api/v1/flows/{id}/pause
## POST /api/v1/flows/{id}/resume
## POST /api/v1/flows/{id}/stop

Control a running flow. These endpoints take no request body.

**Pause a flow**

```bash
curl -X POST http://localhost:7700/api/v1/flows/run-a1b2c3d4/pause
```

**Resume a paused flow**

```bash
curl -X POST http://localhost:7700/api/v1/flows/run-a1b2c3d4/resume
```

**Stop a flow permanently**

```bash
curl -X POST http://localhost:7700/api/v1/flows/run-a1b2c3d4/stop
```

**Response — 200 OK**

```json
{"ok": true}
```

> **Note:** `stop` is permanent — a stopped flow cannot be resumed. Use `pause` if you want to inspect state and continue later.

## GET /api/v1/events?flow_id=ID (SSE)

Subscribe to the real-time event stream for a flow run. The connection uses Server-Sent Events and stays open until the flow completes, fails, or is stopped.

**Subscribe to events**

```bash
curl -N "http://localhost:7700/api/v1/events?flow_id=run-a1b2c3d4"
```

The `-N` flag disables curl buffering so events appear immediately. Each event is a JSON object on a `data:` line followed by a blank line (standard SSE format).

**Complete SSE stream example — implement loops once then passes**

```text
data: {"type":"stage_started","flow_id":"run-a1b2c3d4","stage":"implement","iteration":1,"ts":"2026-03-23T14:01:00Z"}

data: {"type":"stage_completed","flow_id":"run-a1b2c3d4","stage":"implement","iteration":1,"ts":"2026-03-23T14:03:22Z"}

data: {"type":"gate_evaluated","flow_id":"run-a1b2c3d4","stage":"implement","decision":"FAIL","rationale":"2 tests still failing: TestHandleCreate, TestHandleDelete","ts":"2026-03-23T14:03:23Z"}

data: {"type":"stage_looping","flow_id":"run-a1b2c3d4","stage":"implement","iteration":2,"loop_target":"implement","ts":"2026-03-23T14:03:23Z"}

data: {"type":"stage_started","flow_id":"run-a1b2c3d4","stage":"implement","iteration":2,"ts":"2026-03-23T14:03:24Z"}

data: {"type":"stage_completed","flow_id":"run-a1b2c3d4","stage":"implement","iteration":2,"ts":"2026-03-23T14:06:01Z"}

data: {"type":"gate_evaluated","flow_id":"run-a1b2c3d4","stage":"implement","decision":"PASS","rationale":"All tests pass. Implementation matches spec.","ts":"2026-03-23T14:06:02Z"}

data: {"type":"stage_started","flow_id":"run-a1b2c3d4","stage":"review","iteration":1,"ts":"2026-03-23T14:06:03Z"}

data: {"type":"stage_completed","flow_id":"run-a1b2c3d4","stage":"review","iteration":1,"ts":"2026-03-23T14:07:44Z"}

data: {"type":"gate_evaluated","flow_id":"run-a1b2c3d4","stage":"review","decision":"PASS","rationale":"REVIEW.md: DECISION: PASS — implementation is clean and correct.","ts":"2026-03-23T14:07:45Z"}
```

### Event object fields

| Field | Present on | Description |
|---|---|---|
| `type` | All events | Event type string |
| `flow_id` | All events | The run ID (not the flow definition ID) |
| `stage` | Stage events | Stage name |
| `iteration` | stage_started, stage_looping | Current iteration number (1-based) |
| `decision` | gate_evaluated | `PASS` or `FAIL` |
| `rationale` | gate_evaluated | Human-readable explanation from the gate evaluator |
| `loop_target` | stage_looping | Name of the stage the flow is looping back to |
| `ts` | All events | RFC 3339 timestamp |
