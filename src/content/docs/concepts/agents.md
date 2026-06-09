# Agents

Every stage in a DarkTitan pipeline is executed by an agent — a Claude Code subprocess
that DarkTitan spawns, monitors, and cleans up. Agents stream their output back to
DarkTitan in real time, making every action visible in the UI and the terminal.

## What is an agent?

An agent is an instance of the `claude` CLI process launched by DarkTitan to
carry out a stage's work. It receives the stage prompt as its task, runs inside the
project's `local_dir`, and has the full capabilities of Claude Code — reading
and writing files, running shell commands, calling tools — without any approval prompts.

## How DarkTitan launches an agent

For each stage, DarkTitan spawns the following command in the project's `local_dir`:

```bash
claude \
  --print \
  --output-format=stream-json \
  --verbose \
  --dangerously-skip-permissions
```

The flags serve specific purposes:

| Flag | Purpose |
|---|---|
| `--print` | Run non-interactively — process the prompt and exit rather than opening an interactive session. |
| `--output-format=stream-json` | Emit output as a stream of newline-delimited JSON events so DarkTitan can parse and forward each event to the UI and log store. |
| `--verbose` | Include tool call details, reasoning steps, and internal events in the output stream for full observability. |
| `--dangerously-skip-permissions` | Bypass tool approval prompts so the agent can act autonomously without waiting for interactive input. |

> **Note:** `--dangerously-skip-permissions` means agents run without prompting for tool approvals. They can read and modify any file, run any command, and make network requests. Only run DarkTitan flows on codebases and systems you fully trust.

## Agent runs in local_dir

The agent process is started with its working directory set to the project's `local_dir`. This means:

- File paths in prompts can be relative — `src/index.ts` resolves correctly without needing the full absolute path.
- Shell commands like `npm test`, `go build`, or `git diff` run in the project's environment, picking up local tooling, environment variables, and configuration files.
- Any files the agent creates or modifies land directly in your working copy, ready to be reviewed with `git diff` or committed.

## Agent lifecycle

**Agent lifecycle**

```text
DarkTitan spawns agent
        │
        ▼ process starts in local_dir
    SPAWNED
        │
        ▼ agent begins tool calls and output
    STREAMING ──── events forwarded to UI event bus
        │
        ├── agent exits 0 ──▶ COMPLETED  ──▶ gate evaluates
        │
        └── agent exits non-0 ──▶ FAILED  ──▶ stage marked FAILED
```

- **SPAWNED** — DarkTitan has started the process and is waiting for the first output event.
- **STREAMING** — the agent is actively working. Each JSON event from the process is parsed and forwarded to the event bus. The UI and CLI both show these events in real time.
- **COMPLETED** — the agent exited with code 0. DarkTitan passes its accumulated output to the stage's gate for evaluation.
- **FAILED** — the agent exited with a non-zero code or was terminated. The stage is marked FAILED and the pipeline halts unless escalation handles it.

## What agents can do

Agents have the full capability set of Claude Code. In practice this means they can:

- Read any file in the project directory.
- Write, create, rename, and delete files.
- Execute shell commands — run tests, call compilers, invoke scripts.
- Use all Claude Code tools: Bash, Read, Write, Edit, Glob, Grep, and any MCP tools configured in the project.
- Make HTTP requests if permitted by the environment.

## One agent per stage

Each stage gets a brand new Claude Code instance. There is no shared memory or conversation
history between stages. If a later stage needs context from an earlier one, the earlier
stage should write that context to a file (e.g. `REVIEW_NOTES.md`) and the
later stage's prompt should instruct the agent to read it.

**Three stages = three independent agents**

```yaml
stages:
  - name: implement
    prompt: "Implement the feature in TASK.md."
    # Agent 1: fresh Claude Code instance, starts in local_dir

  - name: test
    prompt: "Run the test suite. Fix any failures."
    # Agent 2: another fresh Claude Code instance, same local_dir

  - name: document
    prompt: "Update README.md to reflect the new API."
    # Agent 3: another fresh Claude Code instance, same local_dir
```

## Viewing agent output

Agent output is streamed to two places simultaneously:

- **Terminal** — the `darktitan run` command shows a live feed of agent events as they arrive.
- **Browser UI** — the DarkTitan UI at `http://localhost:7700` shows a real-time event feed for every running and completed pipeline. Stage outputs, gate evaluations, and logs are all stored and searchable after the run completes.
