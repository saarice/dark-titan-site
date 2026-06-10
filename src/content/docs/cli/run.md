# darktitan run

The `run` command starts the DarkTitan API server (if it is not already running) and executes a flow against a project. Agents stream their output back to the terminal in real time.

## Synopsis

```bash
# Execute a specific flow against a project
darktitan run <flow.yaml> [project-name]

# Start the autonomous worker (no arguments)
darktitan run
```

## Description

`darktitan run` has two modes depending on whether you pass arguments:

| Invocation | Mode | What it does |
|---|---|---|
| `darktitan run flow.yaml my-app` | Direct run | Execute one specific flow against one specific project, then exit |
| `darktitan run` | Worker mode | Start a background worker that polls for `IN_PROGRESS` tickets, routes each one to the right flow, and executes them concurrently |

**Direct run** is the primary way to execute a single pipeline. It accepts a path to a flow YAML file and an optional project name. If the project name is omitted, DarkTitan uses the active project set by `darktitan set project`.

**Worker mode** is for autonomous, ticket-driven execution. The worker polls once per second, picks up any `IN_PROGRESS` tickets that have an assigned flow, and runs them concurrently. Tickets are created via the REST API or the UI and moved to `IN_PROGRESS` to queue them. See the [Worker Mode guide](/docs/guides/worker-mode) for a full walkthrough.

Before executing the first stage, DarkTitan resolves the project's `local_dir` from its definition file, starts the API server on the configured port (if not already listening), and sends the flow to the API. Stage agents are then spawned one at a time, each in the project's `local_dir`, and their streamed JSON events are forwarded to the terminal and the event bus.

## Arguments

| Argument | Required | Description |
|---|---|---|
| `flow.yaml` | Yes | Path to the flow YAML file to execute. Can be relative or absolute. |
| `project-name` | No | Name of the registered project to run the flow against. If omitted, the active project (set by `darktitan set project`) is used. |

## Flags

| Flag | Description |
|---|---|
| `--port` | Port for the API server. Defaults to `7700` or the value in `settings.json`. |
| `--daemon`, `-d` | Start the API server in the background and return immediately after submitting the flow. The flow continues running; use `darktitan status` or the UI to monitor it. |
| `--once` | Worker mode only. Route and execute all currently pending tickets exactly once, then exit cleanly. Useful in CI pipelines. |
| `--concurrency` | Worker mode only. Maximum number of tickets to execute simultaneously. Defaults to `5`. |

## How it works

1. DarkTitan reads the flow YAML and validates its structure. Pre-flight validation then runs before the first stage starts: the plugin check confirms every plugin listed in `use` is installed in `~/.claude/plugins/cache/`, and the model check confirms every stage's effective `model` value is a known alias or a valid model ID. If either check fails the run is aborted with a clear error message before any stage executes.
2. It resolves the target project's `local_dir` from the SQLite `projects` table (`store.GetProjectByName`).
3. The API server is started on the configured port if it is not already listening.
4. The flow is submitted to the API, which assigns it a unique flow ID.
5. Stages execute sequentially. For each stage, a Claude Code subprocess is spawned in `local_dir` and its output is streamed back as JSON events.
6. After each stage, the configured gate evaluates the agent's output. A passing gate advances to the next stage; a failing gate halts the pipeline.

## Example

```bash
darktitan run implement.yaml my-app
```

**Example output**

```bash
$ darktitan run implement.yaml my-app

  DarkTitan v0.9.0
  Flow:    implement
  Project: my-app  (/Users/you/code/my-app)

  ● Stage 1/3  plan
    → Spawning agent...
    → Agent STREAMING
    → Tool: Read(src/index.ts)
    → Tool: Write(PLAN.md)
    → Agent COMPLETED  (exit 0)
    → Gate: file_exists(PLAN.md) PASS

  ● Stage 2/3  implement
    → Spawning agent...
    → Agent STREAMING
    → Tool: Read(PLAN.md)
    → Tool: Edit(src/index.ts)
    → Tool: Bash(npm test)
    → Agent COMPLETED  (exit 0)
    → Gate: llm PASS

  ● Stage 3/3  test
    → Spawning agent...
    → Agent STREAMING
    → Tool: Bash(npm test)
    → Agent COMPLETED  (exit 0)
    → Gate: exit_code PASS

  Flow COMPLETED in 4m 12s
```

> **Note:** Use `darktitan ui` to open the browser dashboard and watch the live event feed while a flow is running. The UI shows every agent tool call, gate evaluation, and log line in real time.

> **Note:** Agents run with `--dangerously-skip-permissions`, which means they can read, write, and delete files and execute shell commands without prompting for approval. Make sure your codebase is in a clean state (committed or stashed) before running a flow so you can review and revert agent changes with `git diff`.
