# darktitan edit

The `edit` subcommand modifies existing resources. Currently it supports
`darktitan edit project`, which changes a project's fields.

> **Note:** `edit project` changes a project's stored fields. To change which
> project is *active*, use [`darktitan set project`](/docs/cli/set).

## darktitan edit project

### Synopsis

```bash
darktitan edit project <name-or-id> [flags]
```

### Description

Edits a registered project, identified by its **name**, full **ID**, or a
**unique ID prefix** (the same resolution `darktitan rm project` uses).

You can edit four fields: `name`, `local_dir`, `git_url`, and `description`.

- **With flags** — pass any of `--name`, `--local-dir`, `--git-url`, or
  `--description`. Only the fields you pass change; the rest are left as-is.
- **With no flags** — you're prompted for each field with its current value
  pre-filled. Press Enter to keep a value unchanged.

Renaming is guarded: project names are unique, so renaming onto an existing
name is rejected. If you rename the project that is currently active, the active
project pointer is updated to the new name automatically.

The command works whether or not a DarkTitan server is running — it opens the
store directly.

### Flags

| Flag | Description |
|---|---|
| `--name <name>` | New project name (must be unique) |
| `--local-dir <path>` | New local directory agents run against |
| `--git-url <url>` | New remote git URL |
| `--description <text>` | New free-text description |

### Example sessions

**Edit specific fields with flags**

```bash
$ darktitan edit project my-app --name web-app --git-url https://example.com/web.git
✓ Project "web-app" updated (id: 2803a7d8)
✓ Active project renamed to "web-app"
```

**Edit by a short ID prefix**

```bash
$ darktitan edit project 2803 --description "Customer-facing web app"
✓ Project "web-app" updated (id: 2803a7d8)
```

**Interactive edit (no flags)**

```bash
$ darktitan edit project web-app
Editing project "web-app" (id: 2803a7d8). Press Enter to keep the current value.
  Name [web-app]:
  Description [Customer-facing web app]:
  Local directory [/Users/you/code/web-app]: /Users/you/code/web
  Git URL [https://example.com/web.git]:
✓ Project "web-app" updated (id: 2803a7d8)
```
