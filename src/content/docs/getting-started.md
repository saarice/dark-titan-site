# Installation

Get DarkTitan running on your machine in under two minutes. There are two installation methods:
Homebrew (recommended for macOS) and `go install` (for any platform with Go installed).

## Prerequisites

- **macOS or Linux** — Windows is not currently supported.
- **Go 1.22+** — required only for the `go install` method. Not needed for Homebrew.
- **Anthropic API key OR a local LLM proxy** — DarkTitan uses Claude Code to run pipeline agents. You will be prompted for your key (or proxy URL) during `darktitan init`.

> **Note:** Either an Anthropic API key or a local Anthropic-compatible proxy URL (e.g. Ollama via LiteLLM) is required to use DarkTitan. Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com). If you use a local proxy, see [Local LLM support](#local-llm-support) below.

## Install via Homebrew

The recommended installation method on macOS. Homebrew handles updates and keeps DarkTitan on your `PATH` automatically.

**Homebrew**

```bash
brew install develeap/tap/darktitan
```

## Install via Go

If you have Go 1.22 or later installed, you can install DarkTitan directly from source. The binary will be placed in your `$GOPATH/bin` directory.

**go install**

```bash
go install github.com/darktitan-io/darktitan/cmd/darktitan@latest
```

Make sure `$GOPATH/bin` (or `$(go env GOPATH)/bin`) is on your `PATH`. If it is not, add the following to your shell profile:

**~/.zshrc or ~/.bashrc**

```bash
export PATH="$PATH:$(go env GOPATH)/bin"
```

## Verify the installation

After installing, confirm DarkTitan is available by running:

```bash
darktitan --version
# darktitan v0.9.0 (darwin/arm64)
```

## Initial setup

Before you can run pipelines, DarkTitan needs your Anthropic API key and a few directory preferences. Run `darktitan init` to walk through interactive setup:

```bash
darktitan init
```

The setup wizard prompts you for:

- **Anthropic API key** — stored in `~/.darktitan/settings.json`. Leave blank if you are using a local LLM proxy instead.
- **Local LLM proxy URL** (optional) — an Anthropic-compatible proxy such as Ollama via LiteLLM. When set, the API key is not used. See [Local LLM support](#local-llm-support).
- **Flows directory** — where DarkTitan looks for flow YAML files by default. Default: `~/.darktitan/flows`. Flows are imported here via `darktitan import flow`.

Here is an example init session:

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

Once init completes, your configuration is stored at `~/.darktitan/settings.json`. You can re-run `darktitan init` at any time to update these settings.

## Local LLM support

DarkTitan v2.0.5+ supports routing all LLM traffic through a local Anthropic-compatible proxy (for example, Ollama served via LiteLLM). When a proxy URL is configured, no Anthropic API key is needed.

**Configure during init**

```bash
darktitan init
# At the "Local LLM proxy URL" prompt, enter your proxy address:
#   Local LLM proxy URL (leave blank to use Anthropic API key): http://localhost:4000
```

**Or configure after init with `darktitan set base-url`**

```bash
darktitan set base-url http://localhost:4000
```

This writes `base_url` to `~/.darktitan/settings.json` and clears `anthropic_api_key` (the two settings are mutually exclusive). All LLM calls — Claude Code stage agents, gate evaluations, and AI-based ticket routing — are sent to the proxy.

To revert to the Anthropic API key, clear the `base_url`:

```bash
darktitan set base-url ""
# Then run darktitan init (or edit settings.json) to set your API key
```

## What's next?

With DarkTitan installed and configured, follow the [Quick Start guide](/docs/quick-start) to create your first project, write a flow, and run your first autonomous pipeline.
