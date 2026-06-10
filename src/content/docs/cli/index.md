# CLI Reference

DarkTitan is controlled entirely from the command line. This page covers every command,
its arguments, and its flags. All commands assume DarkTitan has been installed and `darktitan init` has been run at least once.

## Global flags

These flags are accepted by every DarkTitan command and can also be set via environment variables.

| Flag | Default | Description |
|---|---|---|
| `--port` | `7700` | API server port. Also configurable via the `DARKTITAN_PORT` environment variable. |

**Example: override port**

```bash
darktitan --port 8080 run implement.yaml my-app
```

## Command reference

| Command | Description |
|---|---|
| `darktitan init` | Interactive setup — API key, directories |
| `darktitan new project <name>` | Register a new project in SQLite |
| `darktitan new tasks <directory>` | Generate a tasks.md from project docs using Claude |
| `darktitan import tasks <file> [project]` | Import tasks from a Markdown file into the Thinking Department |
| `darktitan import flow <flow-yaml> <project>` | Copy a flow YAML into `~/.darktitan/flows/` and link it to a project |
| `darktitan run <flow> [project]` | Execute a flow |
| `darktitan validate <flow>` | Validate a flow YAML without running |
| `darktitan status` | Show status of all flows |
| `darktitan pause <flow-id>` | Pause a running flow |
| `darktitan resume <flow-id>` | Resume a paused flow |
| `darktitan stop <flow-id>` | Stop a flow permanently |
| `darktitan logs <flow-id>` | Show flow logs |
| `darktitan ui` | Start server + open dashboard |
| `darktitan ls projects` | List all projects |
| `darktitan ls flows` | List installed flow YAML files and the projects each is linked to |
| `darktitan ls blocks` | List available building blocks |
| `darktitan set project <name>` | Set the active project |
| `darktitan set base-url <url>` | Set a local LLM proxy URL (alternative to Anthropic API key) |
| `darktitan stop-server` | Stop a daemonized DarkTitan server |
| `darktitan version` | Print the installed version |
