# darktitan ui

The `ui` command starts both the DarkTitan API server and the Next.js dashboard, then opens the dashboard in your default browser. It is the quickest way to get a full DarkTitan session running.

## Synopsis

```bash
darktitan ui [--port PORT]
```

## Description

Running `darktitan ui` is equivalent to starting the API server and the frontend in a single command. The dashboard connects to the API's SSE event stream automatically and begins showing live data as soon as it loads. You can keep the terminal open to see server logs, or press Ctrl+C to shut everything down.

## Flags

| Flag | Description |
|---|---|
| `--port` | Port for the API server and dashboard. Defaults to `7700` or the value stored in `settings.json`. |

## Example

```bash
darktitan ui
```

**Example output**

```bash
$ darktitan ui

  Starting DarkTitan API server on port 7700...
  Starting dashboard (Next.js)...
  Opening http://localhost:7700 in your browser...

  DarkTitan is running. Press Ctrl+C to stop.
```

**Custom port**

```bash
darktitan ui --port 8080
```

## What you can do in the UI

The dashboard at `http://localhost:7700` provides a complete real-time view of your DarkTitan environment:

- **Live event feed** — every agent tool call, stage transition, gate evaluation, and log line appears in real time via the SSE event stream.
- **Flow builder** — a drag-and-drop YAML editor for creating and modifying flows without writing YAML by hand. Changes can be saved back to disk or run directly from the browser.
- **Pause / resume / stop** — control running flows from the UI without needing the CLI. Flow controls respect the same state machine as the CLI commands.
- **Agent logs** — browse the full log output for any stage in any run, including completed and failed runs. Logs are stored in the SQLite database and searchable by flow ID, stage name, or time range.

> **Note:** The dashboard auto-connects to the SSE event stream at `/events`. There is no need to refresh — new events appear instantly as agents run. Open multiple browser tabs to monitor several flows side by side.
