# darktitan status

The `status` command shows the current state of every flow run DarkTitan knows about — running, paused, completed, and failed. It is the quickest way to get an overview without opening the browser dashboard.

## Synopsis

```bash
darktitan status
```

## Example output

**darktitan status**

```bash
$ darktitan status

  FLOW ID       FLOW NAME    PROJECT    STATUS      CURRENT STAGE   STARTED
  f1a2b3c4      implement    my-app     RUNNING     implement       3m ago
  d5e6f7a8      review       my-app     COMPLETED   —               1h ago
  b9c0d1e2      hotfix       api-svc    FAILED      test            2h ago
  a3b4c5d6      refactor     ui-kit     PAUSED      plan            5h ago
```

The table columns are:

- **FLOW ID** — the unique identifier assigned to this run. Used with `logs`, `pause`, `resume`, and `stop`.
- **FLOW NAME** — the `name` field from the flow YAML.
- **PROJECT** — the project the flow was run against.
- **STATUS** — one of `RUNNING`, `COMPLETED`, `FAILED`, or `PAUSED`.
- **CURRENT STAGE** — the stage currently executing, or `—` if the flow has finished.
- **STARTED** — how long ago the flow was started.

## Pause, resume, and stop

Use a flow ID from `darktitan status` to control running flows:

```bash
# Pause a running flow
darktitan pause f1a2b3c4

# Resume a paused flow
darktitan resume a3b4c5d6

# Stop a flow permanently (cannot be resumed)
darktitan stop f1a2b3c4
```

- `pause` — suspends execution after the current agent finishes. The flow remains in `PAUSED` state until resumed.
- `resume` — continues a paused flow from where it left off, starting the next stage.
- `stop` — permanently terminates a flow. A stopped flow cannot be resumed and its final status is set to `STOPPED`.

## Viewing logs

Use `darktitan logs` to see the event log for a specific flow run. See the [logs reference](/docs/cli/logs) for full details, or use the short forms below:

**Print all logs**

```bash
darktitan logs f1a2b3c4
```

**Stream logs in real time**

```bash
darktitan logs f1a2b3c4 --follow
```

**Example log output**

```bash
$ darktitan logs f1a2b3c4

  [implement / plan]  2026-03-23T14:01:12Z  Agent SPAWNED
  [implement / plan]  2026-03-23T14:01:13Z  Tool: Read(src/index.ts)
  [implement / plan]  2026-03-23T14:01:15Z  Tool: Write(PLAN.md)
  [implement / plan]  2026-03-23T14:01:17Z  Agent COMPLETED (exit 0)
  [implement / plan]  2026-03-23T14:01:17Z  Gate: file_exists(PLAN.md) PASS
  [implement / implement]  2026-03-23T14:01:18Z  Agent SPAWNED
  [implement / implement]  2026-03-23T14:01:20Z  Tool: Read(PLAN.md)
  [implement / implement]  2026-03-23T14:01:25Z  Tool: Edit(src/index.ts)
  [implement / implement]  2026-03-23T14:01:40Z  Tool: Bash(npm test)
  [implement / implement]  2026-03-23T14:01:55Z  Agent STREAMING...
```
