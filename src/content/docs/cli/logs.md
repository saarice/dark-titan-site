# darktitan logs

The `logs` command prints the event log for a specific flow run. It can show the complete history of a finished run or stream new events in real time while a flow is still executing.

## Synopsis

```bash
darktitan logs <flow-id> [--follow]
```

## Description

Every event emitted by an agent — tool calls, stage transitions, gate evaluations, and exit codes — is stored in the DarkTitan SQLite database keyed to the flow's unique ID. `darktitan logs` retrieves and prints these events in chronological order, formatted as `[flow-name / stage-name]  timestamp  event`.

The flow ID is the identifier shown in the first column of `darktitan status` output.

## Flags

| Flag | Description |
|---|---|
| `--follow`, `-f` | Stream new log events in real time as they are emitted. Equivalent to `tail -f` for a running flow. Exits automatically when the flow completes or fails. |

## Examples

**Print all logs for a completed run**

```bash
darktitan logs f1a2b3c4
```

**Example output**

```bash
$ darktitan logs f1a2b3c4

  [implement / plan]  2026-03-23T14:01:12Z  Agent SPAWNED
  [implement / plan]  2026-03-23T14:01:13Z  Tool: Read(README.md)
  [implement / plan]  2026-03-23T14:01:14Z  Tool: Glob(**/*.ts)
  [implement / plan]  2026-03-23T14:01:15Z  Tool: Read(src/index.ts)
  [implement / plan]  2026-03-23T14:01:17Z  Tool: Write(PLAN.md)
  [implement / plan]  2026-03-23T14:01:18Z  Agent COMPLETED (exit 0)
  [implement / plan]  2026-03-23T14:01:18Z  Gate: file_exists(PLAN.md) PASS

  [implement / implement]  2026-03-23T14:01:19Z  Agent SPAWNED
  [implement / implement]  2026-03-23T14:01:20Z  Tool: Read(PLAN.md)
  [implement / implement]  2026-03-23T14:01:22Z  Tool: Read(src/index.ts)
  [implement / implement]  2026-03-23T14:01:28Z  Tool: Edit(src/index.ts)
  [implement / implement]  2026-03-23T14:01:35Z  Tool: Bash(npm run build)
  [implement / implement]  2026-03-23T14:01:48Z  Tool: Bash(npm test)
  [implement / implement]  2026-03-23T14:01:59Z  Agent COMPLETED (exit 0)
  [implement / implement]  2026-03-23T14:02:00Z  Gate: llm PASS

  [implement / test]  2026-03-23T14:02:01Z  Agent SPAWNED
  [implement / test]  2026-03-23T14:02:02Z  Tool: Bash(npm test)
  [implement / test]  2026-03-23T14:02:14Z  Agent COMPLETED (exit 0)
  [implement / test]  2026-03-23T14:02:14Z  Gate: exit_code PASS

  Flow COMPLETED in 1m 2s
```

**Stream logs for a running flow**

```bash
darktitan logs f1a2b3c4 --follow
```

**Example --follow output**

```bash
$ darktitan logs f1a2b3c4 --follow

  [implement / implement]  2026-03-23T14:01:22Z  Tool: Read(src/index.ts)
  [implement / implement]  2026-03-23T14:01:28Z  Tool: Edit(src/index.ts)
  [implement / implement]  2026-03-23T14:01:35Z  Tool: Bash(npm run build)
  ...  (streaming)
```

> **Note:** For a richer view with stage-level navigation and searchable output, use the DarkTitan UI at `http://localhost:7700`. The live event feed in the browser shows the same events with formatting, filtering, and per-stage collapsing.
