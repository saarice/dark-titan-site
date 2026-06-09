# darktitan set

The `set` command updates individual DarkTitan settings without re-running `darktitan init`.

## Subcommands

| Subcommand | Description |
|---|---|
| `darktitan set project <name>` | Set the active project |
| `darktitan set base-url <url>` | Set a local LLM proxy URL |

---

## darktitan set base-url

```bash
darktitan set base-url <url>
```

### Description

Sets a local Anthropic-compatible proxy URL and writes it to `~/.darktitan/settings.json`. When `base_url` is set, all LLM traffic — Claude Code stage agents, gate evaluations, and AI-based ticket routing — is sent to this proxy instead of `api.anthropic.com`. A dummy API key value of `"local"` is used, so no Anthropic API key is required.

Setting `base_url` clears `anthropic_api_key` from settings (the two are mutually exclusive).

### Arguments

| Argument | Description |
|---|---|
| `<url>` | The base URL of your local proxy (e.g. `http://localhost:4000`). Pass an empty string `""` to clear the proxy and revert to the Anthropic API key. |

### Examples

**Set a local proxy (e.g. Ollama via LiteLLM)**

```bash
darktitan set base-url http://localhost:4000
# ✓ base_url set to "http://localhost:4000"
```

**Clear the proxy and revert to the Anthropic API key**

```bash
darktitan set base-url ""
# ✓ base_url cleared — using Anthropic API key
# Then configure your API key:
darktitan init
```

### How the proxy URL is used

When `base_url` is set, DarkTitan appends `/v1/messages` to the URL for direct API calls (gate evaluation, AI routing). Claude Code stage agents receive the base URL via the `ANTHROPIC_BASE_URL` environment variable.

---

## darktitan set project

```bash
darktitan set project <name>
```

### Description

Sets the active project in `~/.darktitan/settings.json`. When an active project is configured, you can omit the project name argument from `darktitan run`:

```bash
darktitan set project my-app
darktitan run implement.yaml   # uses my-app automatically
```

### Arguments

| Argument | Description |
|---|---|
| `<name>` | The name of a registered project (created with `darktitan new project`). |
