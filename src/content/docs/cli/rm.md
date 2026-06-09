# darktitan rm

The `rm` subcommand removes resources. Currently it supports `darktitan rm project`, which deletes a project and everything that references it.

## darktitan rm project

### Synopsis

```bash
darktitan rm project <name-or-id> [flags]
```

### Description

Deletes a project from the local SQLite store. The project can be identified by
its **name**, its full **ID**, or a **unique ID prefix** — DarkTitan resolves
the name first, then an exact ID, then any project whose ID starts with the
given value. A prefix that matches more than one project is reported as
ambiguous rather than guessing, so you can usually pass just the short ID shown
by `darktitan ls projects` (e.g. `4f5d3a2b`).

The delete is a full cascade, run in a single transaction so a partial delete
never lands. It removes:

- the project's **flows** (and their stages, agents, step runs, gate
  evaluations, artifacts, and interventions),
- the project's **flow assignments** (`darktitan import flow` links),
- the project's **tickets** and their comments,
- the project's **backlog items**,
- the **project** record itself.

If the deleted project was the active project, the active project is cleared.

The command works whether or not a DarkTitan server is running — it opens the
store directly.

### Flags

| Flag | Default | Description |
|---|---|---|
| `-f`, `--force` | `false` | Skip the confirmation prompt (useful for scripting) |

### Example session

**darktitan rm project my-app**

```bash
$ darktitan rm project my-app
About to delete project "my-app" (id: 4f5d3a2b):
  - 2 linked flow(s)
  - 7 ticket(s)
  - 1 backlog item(s)
This cannot be undone. Continue? [y/N]: y
✓ Project "my-app" deleted (id: 4f5d3a2b)
✓ Active project cleared
```

**Skip the prompt with `--force`**

```bash
$ darktitan rm project 4f5d3a2b --force
✓ Project "my-app" deleted (id: 4f5d3a2b)
```

> **Warning:** This permanently deletes the project's flows, tickets, and
> backlog. It does not touch any files in the project's `local_dir` on disk —
> only DarkTitan's own records are removed.
