# Stages

A stage is a single unit of work in a DarkTitan pipeline. Each stage spawns one Claude Code
agent, gives it a prompt, waits for it to finish, and then evaluates the result through a
gate before deciding what to do next.

## What is a stage?

Stages are the building blocks of a flow. A flow is essentially an ordered list of stages.
When a pipeline runs, DarkTitan executes stages sequentially — the next stage does not start
until the current stage has passed its gate (or the gate decides to loop or escalate).

Each stage is completely isolated: it gets its own Claude Code subprocess, its own context window, and runs from scratch. This makes stages composable and predictable.

## Stage fields reference

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | *required* | Unique identifier for this stage within the flow. Used in logs, the UI, and when specifying a `loop_target_stage`. |
| `prompt` | string | *required* | The full instruction sent to the Claude Code agent. Supports YAML block scalars (`|`) for multi-line prompts. |
| `gate_type` | string | `auto-pass` | How to evaluate stage output. One of `auto-pass`, `ai-evaluation`, `test-results`, or `manual`. |
| `max_iterations` | int | `10` | Maximum number of times this stage can run (including retries). When this limit is reached, the `escalation` behavior triggers. |
| `escalation` | string | `ai-decide` | What to do when `max_iterations` is reached without passing the gate. One of `pause`, `notify`, `abort`, or `ai-decide`. |
| `loop_target_stage` | string | — | When the gate fails, loop back to this named stage instead of re-running the current stage. Used to create multi-stage feedback cycles. |

## Stage lifecycle

Each stage moves through the following statuses during a pipeline run:

**Stage status flow**

```text
PENDING
  │
  ▼ agent spawned
RUNNING
  │
  ▼ agent process exits
EVALUATING
  │
  ├─── gate passes ──────────────▶ PASSED
  │
  ├─── gate fails, retries remain ▶ LOOPING  ──▶ back to RUNNING
  │
  ├─── max_iterations reached ───▶ ESCALATED
  │
  └─── unrecoverable error ──────▶ FAILED
```

- **PENDING** — the stage is queued and waiting for the previous stage to complete.
- **RUNNING** — a Claude Code agent has been spawned and is actively working.
- **EVALUATING** — the agent has finished and the gate is assessing its output.
- **PASSED** — the gate approved the output; the next stage can begin.
- **LOOPING** — the gate failed but iterations remain; the stage will re-run.
- **ESCALATED** — `max_iterations` was reached; the escalation behavior has been triggered.
- **FAILED** — an unrecoverable error occurred (e.g. agent crashed, abort escalation).

## How prompts work

The `prompt` field is passed verbatim to the Claude Code subprocess as its initial instruction. The agent receives it as the task to complete. There is no templating or interpolation — what you write is exactly what the agent sees.

Because the agent runs inside the project's `local_dir`, you can reference files by their relative paths and the agent will be able to read them. For example, `"Read TASK.md and implement the feature described there."` works without needing to know the absolute path.

## Best practices for prompts

- **Keep each stage focused.** One stage should do one thing — implement, test, review, or document. Mixing concerns makes gate evaluation harder and loops less useful.
- **Reference specific files.** Instead of "write the feature", write "implement the feature described in `TASK.md`, putting the code in `src/handlers/`". The agent works better with concrete targets.
- **Give clear success criteria.** If you are using `ai-evaluation`, tell the agent what "done" looks like. The gate evaluator will use the same criteria to judge the output.
- **Include constraints.** Specify what the agent should *not* do — e.g. "do not modify `package.json`" — to prevent unintended side effects.

**Well-structured prompt example**

```yaml
- name: implement
  prompt: |
    You are working in the repository at the current directory.

    Read TASK.md to understand the feature request.
    Implement the feature in src/. Follow the patterns in existing files.

    When you are done:
    - All existing tests must still pass (run: npm test)
    - Add tests for the new code in tests/
    - Update README.md if the public API changed

    Do not modify package.json or any config files.
  gate_type: test-results
  max_iterations: 5
  escalation: pause
```

## Example stage with gate

```yaml
- name: test
  prompt: "Run the test suite. Fix any failures."
  gate_type: ai-evaluation
  max_iterations: 5
  escalation: pause
```

This stage runs the test suite and fixes failures. If the `ai-evaluation` gate determines the output is unsatisfactory, the stage retries up to 5 times. After 5 attempts without passing, the pipeline pauses and waits for human review.
