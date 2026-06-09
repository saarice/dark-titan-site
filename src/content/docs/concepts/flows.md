# Flows

A flow is a YAML file that defines a sequence of stages for DarkTitan to execute. Each stage
runs a Claude Code agent, and gates between stages decide whether to advance, retry, or escalate.

## What is a flow?

A flow is the top-level unit of work in DarkTitan. It holds an ordered list of stages and
enough metadata to identify it in logs and the UI. Flows are plain YAML files — you can
commit them to your repository, share them across teams, and version them like any other
configuration.

> **Note:** Flows are reusable. Assign the same flow file to multiple projects and DarkTitan will run it in each project's own directory, completely independently.

## Flows vs tickets

The most important design principle for reusable flows is the separation between *how* and *what*:

| Concept | Encodes | Example |
|---|---|---|
| **Flow** | Process — the stages, gates, and loops that describe *how* to do work | scaffold → implement → review-and-fix → polish |
| **Ticket / TASK.md** | Requirements — the specific task description that tells the agent *what* to build | "Build a React to-do list app with localStorage" |

A flow that says "build a snake game" is useless outside that one task. A flow that says
"scaffold, implement, review, polish" can build any web application — the ticket or
`TASK.md` file supplies the requirements. When using [worker mode](/docs/guides/worker-mode), ticket content is prepended to every stage prompt automatically so the agent always has full context.

## Flow lifecycle

Every flow run moves through a fixed set of statuses:

| Status | Meaning |
|---|---|
| `PENDING` | The run has been queued but not yet started. The API server has accepted the request and is preparing to spawn the first stage. |
| `RUNNING` | At least one stage is actively executing. An agent is running, or a gate evaluation is in progress. |
| `COMPLETED` | All stages have passed their gates successfully. The pipeline finished without error or escalation. |
| `FAILED` | A stage or gate encountered an unrecoverable error, or escalation behavior was set to `abort` and triggered. |
| `PAUSED` | A gate failed and escalation is set to `pause` or `notify`. The pipeline is waiting for human input before continuing. |

## Flow YAML structure

Below is a complete, annotated flow file showing all available fields:

**implement.yaml**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  # Human-readable name for this flow — shown in the UI and CLI output
  name: implement-and-review

# Flow-level defaults — inherited by every stage unless overridden
use:
  - superpowers   # Claude Code plugins required by this flow
  - claude-mem

model: sonnet     # Default model alias: opus | sonnet | haiku (or a raw model ID)

spec:
  stages:
    # First stage: implement the feature
    # Inherits: use=[superpowers, claude-mem], model=sonnet
    - name: implement
      prompt: |
        Implement the feature described in TASK.md.
        Write clean, well-tested code following existing patterns.
      # gate_type defaults to "auto-pass" — stage advances immediately
      max_iterations: 10

    # Second stage: review the implementation
    # Overrides model to opus; merges use with flow default → [superpowers, claude-mem]
    - name: review
      model: opus
      prompt: |
        Review the implementation from the previous stage.
        Check for correctness, edge cases, and code quality.
        If the implementation is not satisfactory, say FAIL with a reason.
      gate_type: ai-evaluation
      max_iterations: 3
      escalation: pause
      # loop_target_stage: implement  # optional: loop back to implement on failure
```

The only required fields are `metadata.name` and at least one stage with a `name` and `prompt`. Everything else has sensible defaults.

## Plugins and model selection

Two optional top-level fields let you declare which Claude Code plugins a flow requires and which Claude model it should use.

### use — required plugins

The `use` field lists the Claude Code plugins that must be installed before the flow can run. DarkTitan scans `~/.claude/plugins/cache/` and, if any listed plugin is missing, marks the run as `BLOCKED` and tells you exactly which plugin to install and how.

You can set `use` at the flow level as a default and override or extend it per stage. Stage-level plugin lists are **merged as a union** with the flow-level list — stage entries are added on top of flow entries. To clear all inherited plugins for a specific stage, set `use: []` explicitly on that stage.

### model — Claude model selection

The `model` field controls which Claude model the agent subprocess receives via `--model`. You can use a shorthand alias or a raw Anthropic model ID:

| Alias | Resolves to |
|---|---|
| `opus` | `claude-opus-4-6` |
| `sonnet` | `claude-sonnet-4-6` |
| `haiku` | `claude-haiku-4-5-20251001` |
| *(raw model ID)* | Passed through unchanged (e.g. `claude-sonnet-4-6`) |

Set `model` at the flow level as a default. Individual stages can override it — a stage-level `model` replaces the flow-level value entirely (no merging). If `model` is omitted at both levels, the Claude CLI default is used.

> **Note:** A common pattern is to set `model: sonnet` at the flow level for most stages and override to `model: opus` only on your most demanding review or architecture stage, and `model: haiku` on lightweight formatting or polish stages.

## Creating a flow file

Write the flow YAML directly in your editor — the format is intentionally minimal, just metadata plus a list of stages. Save it anywhere on disk; you'll register it with DarkTitan in the next step.

## Importing a flow into a project

Before running a flow, import it into DarkTitan and link it to the project you want it to operate on. This copies the YAML into `~/.darktitan/flows/` so the worker can find it, and records the project link in SQLite:

```bash
darktitan import flow implement.yaml my-app
# ✓ Copied implement.yaml to ~/.darktitan/flows
# ✓ Linked implement.yaml to project my-app
```

A flow can be linked to multiple projects. Each link is independent — running the flow for one project does not affect others.

## Running a flow

Start a pipeline run with `darktitan run`:

```bash
# Run a specific flow against a specific project
darktitan run implement.yaml my-app

# If you have set an active project, the project name is optional
darktitan run implement.yaml
```

DarkTitan starts the API server if it is not already running, creates a pipeline run record in SQLite, and begins executing stages in order.

## Flow control

Once a pipeline is running, you have full control over its lifecycle:

```bash
# Pause the pipeline after the current stage completes
darktitan pause <flow-id>

# Resume a paused pipeline from where it stopped
darktitan resume <flow-id>

# Abort the pipeline immediately and terminate the running agent
darktitan stop <flow-id>
```

Use `darktitan status` to find the `<flow-id>` (a UUID) for a running flow.

## Checking flow status

The `darktitan status` command shows a summary of all active and recent pipeline runs across all projects:

```bash
darktitan status
# FLOW                    PROJECT   STATUS    STAGE        PROGRESS
# implement-and-review    my-app    RUNNING   implement    stage 1/2
# fix-and-test            api-svc   PAUSED    test         iteration 2/5
# hotfix                  my-app    COMPLETED —            done
```

For live streaming output, open the DarkTitan UI at `http://localhost:7700` or use `darktitan logs <flow-id>`.
