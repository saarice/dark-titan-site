# darktitan new

The `new` subcommand creates new resources. It has two forms: `darktitan new project` registers a codebase as a DarkTitan project, and `darktitan new tasks` generates a tasks.md from a project's existing documentation using Claude.

## darktitan new project

### Synopsis

```bash
darktitan new project <name>
```

### Description

Registers a local codebase as a named DarkTitan project. A project is a named reference to a directory on disk (and optionally a Git repository) that flows run against. Once registered, you can target the project by name in `darktitan run` and `darktitan import flow`.

The project record is stored in the SQLite `projects` table — no YAML mirror is written.

### Interactive prompts

- **Local directory path** — absolute path to the project's root directory. Defaults to the current working directory. Agents will run with this as their working directory.
- **Git URL** — optional remote Git URL for the repository. Used for display purposes and future Git-aware features. Leave blank to skip.

### Example session

**darktitan new project my-app**

```bash
$ darktitan new project my-app

  Local project directory (where the code resides) [/Users/you/code/my-app]:
  Remote git repository URL (optional, press Enter to skip):

✓ Project "my-app" registered (id: 4f5d…)
✓ Active project set to "my-app"
```

> **Note:** At least one of `local_dir` or `git_url` must be provided. If you skip both, DarkTitan will not know where to run agents.

## darktitan new tasks

### Synopsis

```bash
darktitan new tasks <directory> [flags]
```

### Description

Scans a directory for documentation and specification files (`.md`, `.txt`, `.rst`, `README*`, `SPEC*`, `requirements*`, `CHANGELOG*`) up to 3 levels deep, then runs Claude to analyse them and generate a `tasks.md` file. The output file is formatted for use with `darktitan import tasks`.

This command lets you turn an existing project's docs into a ready-to-run DarkTitan backlog in one step.

### Flags

| Flag | Default | Description |
|---|---|---|
| `--output <path>` | `./tasks.md` | Where to write the generated file |
| `--model <alias>` | `sonnet` | Claude model to use: `opus`, `sonnet`, or `haiku` |
| `--limit <n>` | `0` (unlimited) | Maximum number of tasks to generate |

### Example session

```bash
$ darktitan new tasks ./my-project --model sonnet --limit 20
Found 8 documentation file(s) in /Users/you/my-project:
  README.md
  docs/SPEC.md
  docs/requirements.txt
  ...

Analyzing with Claude (sonnet, limit=20)…
✓ Generated 18 task(s) → ./tasks.md

Review the file, then import:
  darktitan import tasks tasks.md
```

### tasks.md format

The generated file uses a structured Markdown format that `darktitan import tasks` understands:

```markdown
## Phase 1: Foundation

- [ ] Initialize Go module and project layout
  - Priority: high
  - Description: Run go mod init, create cmd/, internal/, and pkg/ directories.
  - Label: setup

- [ ] Add database schema
  - Priority: high
  - Description: Create the SQLite schema for users and sessions.
```

Each `- [ ]` line becomes one ticket. `## ` headings become the ticket group. `Priority` and `Label` are optional metadata. Review and edit the file before importing — Claude may miss context only you have.

### Notes

- The `claude` binary must be in `PATH` (installed via `npm install -g @anthropic-ai/claude-code`).
- Hidden directories (`.git`, `node_modules`, `vendor`, `.next`, `dist`) are skipped automatically.
- After reviewing the output, import it with `darktitan import tasks tasks.md`.
