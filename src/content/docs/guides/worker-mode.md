# Worker Mode & Ticket-Driven Flows

Worker mode turns DarkTitan into an autonomous background process that polls for pending
tickets and executes the right flow for each one — no manual `darktitan run flow.yaml project` invocation required. This is how you build pipelines that handle many tasks without human orchestration between each one.

## The core idea

There is a clean separation between *flows* and *tickets*:

| Concept | Describes | Example |
|---|---|---|
| **Flow** | *How* to build something — the scaffold, implement, review, polish stages that apply to *any* project | `web-app-builder.yaml` |
| **Ticket** | *What* to build — the specific requirements, project, and context for one concrete task | "Build a React to-do list app with localStorage" |

A single generic flow can build any web app. The ticket tells the agent what that web app should do. When the worker picks up a ticket, it prepends the ticket's title and description to every stage prompt automatically — so the agent always has the full context of what it is building.

> **Note:** Write flows that describe process. Write tickets that describe requirements. Keep them separate and your flows become reusable across every project and task.

## Starting the worker

Run `darktitan run` with no arguments to start the autonomous worker:

```bash
# Start the autonomous worker (no flow or project args)
darktitan run
```

**Worker output**

```bash
$ darktitan run

  DarkTitan v0.9.0 — worker mode
  Polling for tickets...  (Ctrl-C to stop)
```

The worker polls every second for tickets with status `IN_PROGRESS` that have an assigned flow. When it finds one, it spawns a goroutine and begins executing the flow. Multiple tickets run concurrently up to the configured concurrency limit (default: 5).

## Step-by-step: run a task end-to-end

### 1. Register the project

```bash
darktitan new project todo-app --local-dir ~/projects/todo-app
```

### 2. Put the flow in the flows directory

The worker loads flows from `~/.darktitan/flows/` by default (configured by `darktitan init`). Drop your flow YAML there:

```bash
# Copy a flow into the flows directory and register it
cp web-app-builder.yaml ~/.darktitan/flows/
# No explicit registration needed — the worker reads from the flows directory
```

### 3. Create a ticket

Create a ticket via the API. Use Python for multi-line descriptions — shell heredoc JSON breaks on embedded newlines:

**create_ticket.py**

```python
import json, urllib.request

ticket = {
    "title": "Build a React to-do list app",
    "description": """Build a React + Vite to-do list app with local storage persistence.

Requirements:
- Add, complete, and delete tasks
- Filter by All / Active / Completed
- Persist to localStorage
- Clean, modern UI""",
    "project_id": "PROJECT_UUID",
    "label": "web-app-builder",
}

req = urllib.request.Request(
    "http://localhost:7700/api/v1/tickets",
    data=json.dumps(ticket).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as resp:
    result = json.load(resp)
    print(result["id"])
```

Or via curl for simple single-line descriptions:

```bash
curl -s -X POST http://localhost:7700/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build a React to-do list app",
    "description": "Build a React + Vite to-do list app with local storage persistence.\n\nRequirements:\n- Add, complete, and delete tasks\n- Filter by All / Active / Completed\n- Persist to localStorage\n- Clean, modern UI",
    "project_id": "PROJECT_UUID",
    "label": "web-app-builder"
  }'
```

Set `label` to the flow filename without `.yaml`. This is the fastest routing path — the worker assigns the flow immediately without an AI call.

### 4. Activate the ticket

Tickets start as `TODO`. Move to `IN_PROGRESS` to hand it to the worker:

```bash
curl -s -X PATCH http://localhost:7700/api/v1/tickets/TICKET_UUID \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

The worker picks it up within one polling cycle (≤ 1 second) and begins executing the flow.

## Reference flow: web-app-builder

This is a generic four-stage flow that can build any web application. Copy it into `~/.darktitan/flows/web-app-builder.yaml` and use it as your starting point:

**web-app-builder.yaml**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: web-app-builder

spec:
  stages:
    - name: scaffold
      prompt: |
        Read the ticket to understand what application you are building.
        Create the project skeleton: choose an appropriate tech stack,
        initialise the package manager, create the directory structure,
        and add a minimal working entry point.
        Run the dev server to confirm the scaffold boots without errors.
      gate_type: ai-evaluation
      max_iterations: 2
      escalation: pause

    - name: implement
      prompt: |
        Read the ticket and implement all features described there.
        Follow best practices for the chosen tech stack.
        Run the build and fix any errors before finishing.
      gate_type: ai-evaluation
      max_iterations: 3
      escalation: pause

    - name: review-and-fix
      prompt: |
        Audit the implementation against the ticket requirements.
        Check for missing features, broken functionality, and obvious
        UI/UX issues. Fix anything that does not meet the requirements.
        If the implementation needs substantial rework, say REWORK.
      gate_type: ai-evaluation
      max_iterations: 2
      escalation: pause
      loop_target_stage: implement

    - name: polish
      prompt: |
        Apply final visual and UX polish. Improve spacing, typography,
        and interactive states. Do not add new features or change
        business logic — only presentation improvements.
      gate_type: auto-pass
```

> **Note:** The prompts in this flow contain no project-specific details. All requirements come from the ticket. The `review-and-fix` stage has `loop_target_stage: implement` so it loops back to fix any issues it finds rather than blocking.

## How ticket context reaches the agent

When worker mode executes a stage, it prepends the ticket title and description to the stage prompt before spawning the Claude Code agent. The agent receives something like:

**Effective prompt received by the agent**

```text
# What the implement stage agent actually receives:

## Ticket context
Title: Build a React to-do list app

Build a React + Vite to-do list app with local storage persistence.

Requirements:
- Add, complete, and delete tasks
- Filter by All / Active / Completed
- Persist to localStorage
- Clean, modern UI

---

# Stage prompt (from flow YAML):
Read the ticket and implement all features described there.
Follow best practices for the chosen tech stack.
Run the build and fix any errors before finishing.
```

This means you do not need to mention the project name or task in the flow YAML at all. The flow stays generic; the ticket provides the specifics.

## Ticket routing

The worker routes tickets to flows in three ways, evaluated in order:

### Label-based routing (recommended)

Set a `label` on the ticket matching the flow filename (without `.yaml`). The worker assigns the flow instantly, with no AI call:

**Label → flow mapping**

```text
# Label matches flow filename exactly (without .yaml extension)
{
  "label": "web-app-builder"   →   ~/.darktitan/flows/web-app-builder.yaml
  "label": "feature-pipeline"  →   ~/.darktitan/flows/feature-pipeline.yaml
  "label": "hotfix"            →   ~/.darktitan/flows/hotfix.yaml
}
```

### Project-flow routing

If a ticket has no label but has a `project_id`, and that project has flows linked to it (via `darktitan import flow`), the worker assigns the first matching flow from the project's link list. This is faster than AI routing and requires no label on the ticket.

### AI-based routing

If no `label` is set and no project-flow assignment applies, the worker sends the available flow names plus the ticket metadata to Claude and asks it to choose the best match. This uses the same API key or proxy URL configured for stage agents — either `anthropic_api_key` in `settings.json`, the `ANTHROPIC_API_KEY` environment variable, or `base_url`.

```bash
# AI routing is used when no label is set and no project-flow mapping applies.
# Uses the same credentials as all other LLM calls (settings.json or env var).

darktitan run
```

> **Warning:** If you see `no API key or base_url configured, skipping AI routing` in the worker logs, your unlabelled tickets will not be assigned to a flow automatically. Configure an API key or local proxy URL, or use label-based routing instead.

## Ticket lifecycle

| Status | Meaning |
|---|---|
| `TODO` | Ticket exists but is not yet queued for execution |
| `IN_PROGRESS` | Worker has picked up the ticket and is executing the flow |
| `IN_REVIEW` | A gate hit `max_iterations` with `escalation: pause` — the flow is waiting for human input |
| `DONE` | All stages completed successfully |
| `BLOCKED` | An unrecoverable error occurred (bad flow YAML, missing project directory, etc.) |

## Zombie ticket recovery

If the DarkTitan process crashes while a ticket is `IN_PROGRESS`, the ticket is left in a stuck state — the worker will not pick it up again because it already appears to be running. Reset it to `TODO` to re-queue it:

**Reset a stuck ticket**

```bash
# If the worker crashes while a ticket is IN_PROGRESS, the ticket is stuck.
# Reset it to TODO so the worker picks it up again:

curl -s -X PATCH http://localhost:7700/api/v1/tickets/TICKET_UUID \
  -H "Content-Type: application/json" \
  -d '{"status": "TODO"}'

# Then restart the worker:
darktitan run
```

## API daily usage limit handling

When the Anthropic API daily usage limit is reached mid-execution, DarkTitan handles it gracefully:

1. The in-flight ticket is **reset to `TODO`** (not left as `IN_PROGRESS` and not marked `DONE`). Its `assigned_flow_name`, `assigned_flow_id`, and `current_stage` fields are also cleared.
2. A system comment is added to the ticket explaining what happened.
3. The **ticket router is paused** — no new tickets are routed until the process is restarted.
4. All other in-flight tickets continue to completion normally.

When your Anthropic usage limit resets (typically at midnight UTC), simply restart `darktitan run`. The reset ticket will be in `TODO` status and will be picked up and routed again automatically.

```bash
# After the daily usage limit resets, restart the worker to resume:
darktitan run
```

> **Note:** This behavior applies to the Anthropic API usage limit specifically. Regular rate limiting (429 responses) is handled separately with automatic retries and does not trigger this flow.

## One-shot mode

Use `--once` to route and execute all pending tickets exactly once, then exit. Useful in CI pipelines or scripts where you want DarkTitan to drain the queue and stop:

```bash
# Route and execute all pending tickets once, then exit cleanly.
# Useful for CI or scripted pipelines.
darktitan run --once
```
