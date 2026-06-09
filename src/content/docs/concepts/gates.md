# Gates & Loops

Gates are quality checkpoints that run after each stage. They decide whether the agent's
output is good enough to advance, needs another attempt, or requires human attention.
Combined with loops, gates give DarkTitan its self-correcting behaviour.

## What are gates?

Every stage has a gate. After the Claude Code agent finishes, the gate evaluates the output
and returns one of three decisions:

- **PASS** — the output meets the bar; move on to the next stage.
- **FAIL** — the output does not meet the bar; retry the stage (if iterations remain) or escalate (if the limit is hit).
- **ESCALATE** — skip the retry loop and escalate immediately, regardless of the iteration count.

The gate type for a stage is set with the `gate_type` field. If omitted, it defaults to `auto-pass`.

## Gate types

### auto-pass

The default gate. Always returns PASS immediately after the agent exits. Use this for stages
that do not need quality evaluation — scaffolding, file generation, or any step where the
agent completing without error is sufficient.

```yaml
- name: scaffold
  prompt: "Create the directory structure for the new module."
  # gate_type: auto-pass  (this is the default)
```

### ai-evaluation

DarkTitan calls Claude (Haiku) with the stage's prompt and the agent's output and asks it
to evaluate quality. The evaluator returns **PASS**, **FAIL**, or **ESCALATE** along with a short rationale that is recorded in the run log.

This is the most powerful gate type. It works well for subjective quality checks —
code review, documentation completeness, correctness of a refactor — where a fixed rule
cannot capture the full intent.

```yaml
- name: review
  prompt: "Review the implementation. Check correctness, style, and test coverage."
  gate_type: ai-evaluation
  max_iterations: 3
  escalation: pause
```

### test-results

DarkTitan parses the agent's output for test runner output (Jest, Go test, pytest, and
others). If all tests pass, the gate returns PASS. If any tests fail, it returns FAIL and
the stage retries.

This gate is well-suited to stages whose job is to make a test suite green — the objective signal is right there in the output.

```yaml
- name: fix-tests
  prompt: "Run npm test. Fix any failing tests. Do not delete tests."
  gate_type: test-results
  max_iterations: 5
  escalation: notify
```

### manual

The gate pauses and waits for a human to approve or reject via the REST API or the
DarkTitan UI. The pipeline remains in `EVALUATING` state until an override is submitted.

Use manual gates for high-stakes stages — deploying to production, sending communications, or any action that should always have a human in the loop.

**Submitting a manual gate decision**

```bash
# Approve a paused gate via the REST API
curl -X POST http://localhost:7700/api/v1/flows/{id}/stages/{stageID}/gate-override \
  -H "Content-Type: application/json" \
  -d '{"decision": "pass"}'

# Or reject it (triggers escalation)
curl -X POST http://localhost:7700/api/v1/flows/{id}/stages/{stageID}/gate-override \
  -H "Content-Type: application/json" \
  -d '{"decision": "fail"}'
```

## How loops work

When a gate fails, DarkTitan does not give up. It re-runs the stage with the same prompt, incrementing an iteration counter. This loop continues until either the gate passes or the counter reaches `max_iterations`.

**Gate decision flow**

```text
Stage runs
    │
    ▼ agent finishes
Gate evaluates
    │
    ├── PASS ──────────────────────▶ next stage
    │
    ├── FAIL (iterations < max) ───▶ re-run stage (or loop_target_stage)
    │
    └── FAIL (iterations = max) ───▶ escalation behavior
```

> **Warning:** Loops consume API tokens on every iteration — both the agent run and (for `ai-evaluation`) the gate evaluation call. Set reasonable `max_iterations` values to avoid unexpected costs. The default is 10.

## Escalation behaviors

When `max_iterations` is reached without a PASS, the escalation behavior determines what happens next:

| Behavior | What happens |
|---|---|
| `pause` | The pipeline halts and its status becomes `PAUSED`. Use `darktitan resume` to continue or `darktitan stop` to abort. |
| `notify` | Same as `pause`, but DarkTitan also emits a notification event. Useful when you want to be alerted without actively watching the terminal. |
| `abort` | The pipeline is marked `FAILED` and all running agents are terminated immediately. Use this when a failure at this stage makes the rest of the pipeline meaningless. |
| `ai-decide` | Claude evaluates the situation and decides whether to pause, continue, or abort. This is the default escalation behavior. |

## Loop target stages

By default, when a gate fails the same stage re-runs. Setting `loop_target_stage` changes this: the pipeline jumps back to the named stage instead. This enables multi-stage feedback loops.

A common pattern is an implement-then-review cycle where a failing review sends the pipeline back to the implementation stage with context from the review:

**implement → review → implement loop**

```yaml
stages:
  - name: implement
    prompt: "Implement the feature in TASK.md"

  - name: review
    prompt: "Review the implementation. If it needs rework, say FAIL."
    gate_type: ai-evaluation
    loop_target_stage: implement
    max_iterations: 3
    escalation: pause
```

In this example, when the `review` gate fails, the pipeline rewinds to `implement`. The agent re-runs with the original implement prompt. After 3 full implement-review cycles without passing, the pipeline pauses.
