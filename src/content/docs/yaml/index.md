# Flow YAML Reference

A DarkTitan flow is defined in a YAML file. This reference documents every field — what it does, what values it accepts, and how the engine interprets it at runtime.

## Annotated schema

**Full schema with annotations**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: my-flow          # Required: unique identifier

use:                     # Optional: Claude Code plugins required by this flow
  - superpowers          #   validated against ~/.claude/plugins/cache/ before first stage
  - claude-mem

model: sonnet            # Optional: default model for all stages
                         #   aliases: opus | sonnet | haiku  (or a raw model ID)

spec:
  stages:                # Required: list of stages
    - name: stage-name   # Required: unique within flow
      prompt: |          # Required: agent instructions
        Do the thing.
      gate_type: auto-pass      # Optional: auto-pass | ai-evaluation | test-results | manual
      max_iterations: 10        # Optional: default 10
      escalation: ai-decide     # Optional: pause | notify | abort | ai-decide
      loop_target_stage: ""     # Optional: stage name to loop back to
      use:               # Optional: stage-level plugins (merged union with flow-level use)
        - superpowers    #   use: [] explicitly clears all inherited plugins for this stage
      model: opus        # Optional: overrides flow-level model for this stage only
```

## Top-level fields

| Field | Required | Description |
|---|---|---|
| `apiVersion` | Yes | Always `darktitan.io/v1`. Used for forward compatibility. |
| `kind` | Yes | Always `Flow`. |
| `metadata.name` | Yes | A unique, human-readable identifier for this flow. Used in CLI output, API responses, and log messages. Must be a valid DNS label: lowercase letters, digits, and hyphens. |
| `spec.stages` | Yes | An ordered list of stage objects. Stages execute sequentially in the order listed. At least one stage is required. |
| `use` | No | A list of Claude Code plugin names required by this flow. DarkTitan checks that every listed plugin is installed (via `~/.claude/plugins/cache/`) before the first stage runs. If any are missing the run is marked `BLOCKED`. Each stage inherits this list by default; a stage can extend it (union) or clear it entirely with `use: []`. |
| `model` | No | Default Claude model for all stages in this flow. Accepts the shorthand aliases `opus`, `sonnet`, `haiku`, or a raw Anthropic model ID (e.g. `claude-sonnet-4-6`). When set, DarkTitan passes `--model <id>` to the Claude subprocess. Stages can override this value individually. If omitted at both levels, the Claude CLI default is used. |

## Stage fields reference

| Field | Required | Default | Description |
|---|---|---|---|
| `name` | Yes | — | Unique identifier for this stage within the flow. Used in logs, API responses, and as the target for `loop_target_stage`. Lowercase, hyphens allowed. |
| `prompt` | Yes | — | Instructions sent to the AI agent for this stage. Supports multi-line YAML block scalar (`|`). The agent has access to the project directory and all standard tools (Read, Write, Edit, Bash, Glob). |
| `gate_type` | No | `auto-pass` | Determines how the stage is evaluated before advancing. See gate_type values below. |
| `max_iterations` | No | `10` | Maximum number of times the stage will re-run if its gate fails. When this limit is reached, the `escalation` policy is triggered. |
| `escalation` | No | `ai-decide` | What happens when `max_iterations` is exhausted without a gate pass. See escalation values below. |
| `loop_target_stage` | No | `""` (self) | When the gate fails, loop back to this named stage instead of re-running the current one. Empty string means retry the current stage. The target must appear earlier in the stage list. |
| `use` | No | Inherited from flow | Stage-level plugin list. Merged as a **union** with the flow-level `use` list — entries here are added on top of any flow-level plugins. Set `use: []` to explicitly clear all inherited plugins for this stage. Omitting the field entirely inherits the flow-level list unchanged. |
| `model` | No | Inherited from flow | Overrides the flow-level `model` for this stage only. Accepts the same values: `opus`, `sonnet`, `haiku`, or a raw model ID. A stage-level value fully replaces (does not merge with) the flow-level value. |

## gate_type values

| Value | Description |
|---|---|
| `auto-pass` | The gate always passes immediately after the agent completes. Use for stages where correctness is enforced by later stages or where you trust the agent unconditionally. |
| `ai-evaluation` | A separate AI evaluation pass reviews the agent's output and returns PASS or FAIL with a rationale. Claude reads the stage prompt, the agent's work, and the project files to make the determination. |
| `test-results` | DarkTitan runs the project's test command and parses the exit code. Exit 0 is PASS; any non-zero exit is FAIL. The agent is given the test output when it loops. |
| `manual` | The flow pauses and waits for a human decision via `POST /api/v1/flows/{flowID}/stages/{stageID}/gate-override`. Useful for compliance checkpoints or human-in-the-loop review. |

## escalation values

| Value | Description |
|---|---|
| `pause` | The flow pauses and waits. You can inspect the state, make manual edits, and then resume with `POST /api/v1/flows/{id}/resume`. |
| `notify` | An escalation event is emitted on the SSE stream and recorded in the event log. The flow continues (the gate is treated as passed) so downstream stages still run. |
| `abort` | The flow is immediately terminated with a FAILED status. No further stages run. Use this when a failed gate represents a hard blocker. |
| `ai-decide` | Claude evaluates the situation and decides whether to pass, fail, or pause the flow. This is the default and works well when you want intelligent escalation behaviour without manual configuration. |

## Full example: implement / review / test

A three-stage flow that implements a feature, reviews it with a loop back to implementation if the review fails, and finally validates with the test suite.

**implement-review-test.yaml**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: implement-review-test
spec:
  stages:
    - name: implement
      prompt: |
        Read TASK.md and implement the described feature.
        Write clean, idiomatic code. Add inline comments where logic is non-obvious.
        Run the test suite before finishing and ensure all tests pass.
      gate_type: ai-evaluation
      max_iterations: 5
      escalation: ai-decide

    - name: review
      prompt: |
        Review the implementation produced by the implement stage.
        Check for correctness, edge cases, readability, and adherence to the task spec in TASK.md.
        Write a REVIEW.md summarising findings. If changes are needed, be explicit.
      gate_type: ai-evaluation
      max_iterations: 3
      escalation: pause
      loop_target_stage: implement

    - name: test
      prompt: |
        Run the full test suite with `npm test`.
        If any tests fail, investigate and fix the root cause.
        Do not skip or comment out failing tests.
      gate_type: test-results
      max_iterations: 3
      escalation: notify
```

> **Note:** Save flow files alongside your project code and commit them. Treat flow YAML the same as CI configuration — it is part of your project's automation infrastructure.
