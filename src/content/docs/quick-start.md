# Quick Start

This guide walks you through the full DarkTitan workflow end-to-end: create a project, write a
flow, import it, run it, and watch live output in the browser UI — all in under ten minutes.

> **Note:** Make sure you have completed [Installation](/docs/getting-started) and run `darktitan init` before continuing. You will need either an Anthropic API key or a local LLM proxy URL configured.

## Step 1 — Initialize DarkTitan

If you have not already, run the init wizard to configure your API key and directories:

```bash
darktitan init
```

This stores your settings at `~/.darktitan/settings.json`. You only need to do this once.

## Step 2 — Create a project

A project links a name to a local directory in your filesystem. DarkTitan agents will read and
write files inside this directory when running pipeline stages.

```bash
darktitan new project my-app
#   Local project directory (where the code resides) [/cwd]: /Users/you/code/my-app
#   Remote git repository URL (optional, press Enter to skip):
# ✓ Project "my-app" registered (id: 4f5d…)
# ✓ Active project set to "my-app"
```

The project record is stored in DarkTitan's SQLite database at `~/.darktitan/data.db`. There is no per-project YAML file on disk. List all projects with `darktitan ls projects`.

## Step 3 — Write a flow

A flow is a YAML file that describes your pipeline. Save the following as `implement.yaml` in your current directory (or anywhere you prefer):

**implement.yaml**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: implement-and-review
spec:
  stages:
    - name: implement
      prompt: |
        Implement the feature described in TASK.md.
        Write clean, well-tested code following existing patterns.
    - name: review
      prompt: |
        Review the implementation from the previous stage.
        Check for correctness, edge cases, and code quality.
      gate_type: ai-evaluation
      max_iterations: 3
      escalation: pause
```

This flow has two stages:

- **implement** — runs a Claude Code agent with instructions to implement whatever is described in `TASK.md` in your project directory. No gate is specified, so it advances automatically.
- **review** — runs a second Claude Code agent to review the implementation. This stage has an `ai-evaluation` gate that scores the output. If the gate fails, the stage will retry up to `max_iterations: 3` times before escalating (pausing for your input) if it never passes.

> **Note:** Before running the flow, create a `TASK.md` file in your project directory describing the feature you want implemented. The agent will read it as its primary instruction.

## Step 4 — Import the flow into the project

Before running, import the flow YAML and link it to your project. This copies the flow into `~/.darktitan/flows/` so the worker can find it, and records the link in SQLite:

```bash
darktitan import flow implement.yaml my-app
# ✓ Copied implement.yaml to ~/.darktitan/flows
# ✓ Linked implement.yaml to project my-app
```

You can link one flow to multiple projects, or multiple flows to the same project. Links are stored in the SQLite `project_flows` table.

## Step 5 — Run

Start the pipeline with `darktitan run`:

```bash
darktitan run implement.yaml my-app
```

DarkTitan starts the API server (if it is not already running), spawns a Claude Code agent for the first stage, evaluates the gate, advances to the next stage, and streams progress to your terminal:

**Output**

```bash
$ darktitan run implement.yaml my-app

  [implement-and-review] Starting pipeline
  ──────────────────────────────────────────────────

  [stage 1/2] implement
  → Spawning Claude Code agent...
  → Agent working in /Users/you/code/my-app
  ✓ Stage complete  (1m 42s)

  [gate] ai-evaluation
  → Evaluating output quality...
  ✓ Gate passed

  [stage 2/2] review
  → Spawning Claude Code agent...
  → Agent reviewing implementation...
  ✓ Stage complete  (0m 58s)

  [gate] ai-evaluation  (attempt 1/3)
  → Evaluating review output...
  ✓ Gate passed

  ──────────────────────────────────────────────────
  Pipeline complete in 2m 40s
```

If a gate fails and `escalation: pause` is set, DarkTitan will pause the pipeline and wait for you to review. Use `darktitan resume <flow-id>` to continue or `darktitan stop <flow-id>` to abort. Find the flow ID with `darktitan status`.

## Step 6 — Watch the UI

In a separate terminal (or while the pipeline is running), open the live feed UI in your browser:

```bash
darktitan ui
# Opening DarkTitan UI at http://localhost:7700
```

> **Note:** The DarkTitan UI at `http://localhost:7700` shows a real-time feed of agent output, stage status, gate evaluations, and logs for every running and completed pipeline. You can pause, resume, and inspect individual stages without leaving the browser.

## Managing pipeline state

Once a pipeline is running you have full control over its lifecycle:

| Command | What it does |
|---|---|
| `darktitan status` | Show status of all active and recent pipelines (includes flow IDs). |
| `darktitan logs <flow-id>` | Stream agent output and stage logs to your terminal. |
| `darktitan pause <flow-id>` | Pause the pipeline after the current stage finishes. |
| `darktitan resume <flow-id>` | Resume a paused pipeline from where it stopped. |
| `darktitan stop <flow-id>` | Abort the pipeline immediately and terminate the running agent. |

## What's next?

You have run your first DarkTitan pipeline. From here, explore:

- [Flow concepts](/docs/concepts/flows) — understand how stages, gates, and loops compose into a pipeline.
- [YAML Reference](/docs/yaml) — full schema for every flow configuration option.
- [CLI Reference](/docs/cli) — every command with flags and examples.
- [Guides](/docs/guides/first-flow) — practical patterns for real-world pipelines.
