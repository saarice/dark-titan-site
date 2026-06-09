# darktitan init

The `init` command walks you through interactive setup and writes your
configuration to `~/.darktitan/settings.json`. It must be run before any other DarkTitan command.

## Synopsis

```bash
darktitan init
```

## Description

Running `darktitan init` launches an interactive wizard that prompts for three pieces of information and writes the result to disk. The wizard is safe to re-run — answering the prompts again will overwrite whatever was set previously.

The configuration file is stored at `~/.darktitan/settings.json` and is read by every subsequent DarkTitan command. It is a plain JSON file and can be edited manually if preferred.

## What it configures

- **Anthropic API key** — the key used to authenticate with the Anthropic API when DarkTitan launches Claude Code agents. Stored in `settings.json`. Leave blank if you are using a local LLM proxy instead.
- **Local LLM proxy URL** (optional) — an Anthropic-compatible proxy URL (e.g. `http://localhost:4000`). When set, all LLM traffic goes to this proxy and the Anthropic API key is not used. Mutually exclusive with the API key; setting one clears the other.
- **flows_dir** — the directory where DarkTitan looks for flow YAML files. Default: `~/.darktitan/flows`. Flows are imported here via `darktitan import flow`.

## Example session

**darktitan init**

```bash
$ darktitan init

  ██████╗  █████╗ ██████╗ ██╗  ██╗████████╗██╗████████╗ █████╗ ███╗   ██╗
  ██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║
  ██║  ██║███████║██████╔╝█████╔╝    ██║   ██║   ██║   ███████║██╔██╗ ██║
  ██║  ██║██╔══██║██╔══██╗██╔═██╗    ██║   ██║   ██║   ██╔══██║██║╚██╗██║
  ██████╔╝██║  ██║██║  ██║██║  ██╗   ██║   ██║   ██║   ██║  ██║██║ ╚████║
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝

  Autonomous software pipelines, powered by Claude Code.

? Anthropic API key: sk-ant-api03-••••••••••••••••
? Local LLM proxy URL (leave blank to use Anthropic API key):
? Flows definitions directory [~/.darktitan/flows]:

  ✓ Settings saved to ~/.darktitan/settings.json
```

Pressing Enter at a bracketed prompt accepts the default value shown in brackets. In the example above, the flows directory prompt was accepted as default.

## Configuration file

After `init` completes, the following file is written to disk. All fields can also be edited manually.

**~/.darktitan/settings.json (Anthropic API key)**

```json
{
  "anthropic_api_key": "sk-ant-...",
  "flows_dir": "/Users/you/.darktitan/flows",
  "port": 7700,
  "storage_path": "/Users/you/.darktitan/data.db"
}
```

**~/.darktitan/settings.json (local LLM proxy)**

```json
{
  "base_url": "http://localhost:4000",
  "flows_dir": "/Users/you/.darktitan/flows",
  "port": 7700,
  "storage_path": "/Users/you/.darktitan/data.db"
}
```

| Field | Description |
|---|---|
| `anthropic_api_key` | Anthropic API key used by all stage agents and gate evaluations. Mutually exclusive with `base_url`. |
| `base_url` | Local Anthropic-compatible proxy URL (e.g. `http://localhost:4000`). When set, all LLM traffic goes to this proxy and `anthropic_api_key` is ignored. Mutually exclusive with `anthropic_api_key`. |
| `flows_dir` | Directory where flow YAML files are stored. Flows land here when imported via `darktitan import flow`. |
| `port` | Default API server port. Overridable per-command with `--port`. |
| `storage_path` | Path to the SQLite database that stores projects, flow runs, logs, and project-flow links. |

## Environment variables

The `ANTHROPIC_API_KEY` environment variable, if set, takes precedence over the value stored in `settings.json`. This is useful in CI environments or when rotating keys without re-running `init`.

**Using ANTHROPIC_API_KEY env var**

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
darktitan run implement.yaml my-app
```

The `DARKTITAN_BASE_URL` environment variable can likewise override `base_url` from settings.json.

> **Note:** Re-running `darktitan init` overwrites all existing settings in `~/.darktitan/settings.json`. If you only want to update a single field, edit the file directly or use `darktitan set base-url <url>` for the proxy URL or `darktitan set project <name>` for the active project.

> **Note:** If a `~/.darktitan/darktitan.json` or `~/.darktitan/config.json` legacy config file exists and `settings.json` does not, running `darktitan init` will automatically migrate the legacy file to `settings.json`.
