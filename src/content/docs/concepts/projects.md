# Projects

A project is DarkTitan's link between a name and a codebase. It tells DarkTitan where to find
your code, which flows belong to it, and where agents should operate when a pipeline runs.

## What is a project?

At its core, a project is a pointer to a directory on disk (and optionally a git repository)
paired with a list of linked flows. When you run a pipeline, DarkTitan reads the project to
know where to send the Claude Code agent.

Projects serve as the unit of organisation in DarkTitan:

- One project per codebase or service.
- Multiple flows can be linked to the same project.
- The same flow file can be linked to many projects — reuse without duplication.
- All pipeline history, logs, and stage outputs are stored and indexed by project name.

## Creating a project

Use `darktitan new project` to create a project interactively. DarkTitan will prompt you for a local directory and an optional git URL:

```bash
darktitan new project my-app
#   Local project directory (where the code resides) [/cwd]: /Users/you/code/my-app
#   Remote git repository URL (optional, press Enter to skip): https://github.com/you/my-app
# ✓ Project "my-app" registered (id: 4f5d…)
# ✓ Active project set to "my-app"
```

Projects are stored in DarkTitan's SQLite database at `~/.darktitan/data.db`. There is no per-project YAML file on disk.

## Project fields

| Field | Set via | Description |
|---|---|---|
| `name` | `<name>` argument | Unique identifier used in all CLI commands |
| `local_dir` | Interactive prompt or API `local_dir` | Absolute path to the directory agents will operate inside. Required if `git_url` is not set. |
| `git_url` | Interactive prompt or API `git_url` | Optional. Remote git URL — used for display today, future Git-aware features later. |

> **Note:** At least one of `local_dir` or `git_url` must be set. If only `git_url` is provided, DarkTitan will clone the repository into a temporary directory before running agents.

## How DarkTitan uses local_dir

When a stage runs, DarkTitan spawns a Claude Code subprocess and sets its working directory to `local_dir`. The agent can read, write, and execute anything within that directory. This means:

- Prompts can reference files by relative path (e.g. `TASK.md`, `src/index.ts`) without needing to know the full path.
- Any code changes the agent makes land directly in your working copy, subject to your version control as normal.
- Commands run by the agent (tests, builds, linters) execute in the same environment as your local shell.

## Linking flows to a project

Use `darktitan import flow` to copy a flow YAML into the flows directory and link it to a project in one step:

```bash
darktitan import flow ./pipelines/implement.yaml my-app
# ✓ Copied implement.yaml to ~/.darktitan/flows
# ✓ Linked implement.yaml to project my-app
```

The link is recorded in the SQLite `project_flows` table. A flow can be linked to multiple projects.

## Listing projects

To see all configured projects along with their local directories, linked flows, and creation dates:

```bash
darktitan ls projects
# NAME       LOCAL DIR                    FLOWS   CREATED
# my-app     /Users/you/code/my-app       2       2026-03-20
# api-svc    /Users/you/code/api-svc      1       2026-03-21
```

## Setting the active project

When you have a single primary project you work with, set it as active to avoid typing the project name on every command:

```bash
darktitan set project my-app
# Active project set to "my-app"

# Now you can run flows without specifying the project name:
darktitan run implement.yaml
```

The active project is stored in `~/.darktitan/settings.json` and used as the default whenever a command expects a project name and none is provided.

## Editing a project

Use [`darktitan edit project`](/docs/cli/edit) to change a project's stored fields (`name`, `local_dir`, `git_url`, `description`). Pass flags to edit specific fields, or run with no flags for an interactive prompt:

```bash
darktitan edit project my-app --git-url https://github.com/you/my-app
# ✓ Project "my-app" updated (id: 2803a7d8)
```

Renaming is guarded — names stay unique. If the renamed project was active, the active pointer updates automatically.

## Removing a project

Use [`darktitan rm project`](/docs/cli/rm) to delete a project and everything that references it. The delete cascades in a single transaction across linked flows, stages, tickets, backlog items, and assignments. Files in `local_dir` on disk are **not** touched — only DarkTitan's own records:

```bash
darktitan rm project my-app
# About to delete project "my-app" (id: 4f5d3a2b):
#   - 2 linked flow(s)
#   - 7 ticket(s)
#   - 1 backlog item(s)
# This cannot be undone. Continue? [y/N]: y
# ✓ Project "my-app" deleted
```

Pass `--force` to skip the confirmation prompt (useful in scripts).

## Project storage

DarkTitan stores all project data in `~/.darktitan/data.db`, a single SQLite database:

| Table | Contents |
|---|---|
| `projects` | The project record itself: name, local_dir, git_url, timestamps. |
| `project_flows` | Many-to-many links between projects and flow filenames. |
| `flows`, `stages`, `agent_instances`, etc. | Pipeline run history, stage logs, gate results, and event data. |

Flow YAML definitions live separately under `~/.darktitan/flows/<name>.yaml` — those files describe what flows do, while the SQLite tables track what runs have happened.
