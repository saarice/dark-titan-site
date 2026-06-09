# API: Projects

Projects are a way to group related flow runs under a single named entity. Each project has a name, a local directory, and an optional git URL. You can assign multiple saved flow definitions to a project and run any of them against the project's directory.

## POST /api/v1/projects

Create a new project.

**Request**

```bash
curl -X POST http://localhost:7700/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app",
    "local_dir": "/Users/alice/projects/my-app",
    "git_url": ""
  }'
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Human-readable name for the project |
| `local_dir` | Yes | Absolute path to the project's working directory on disk |
| `git_url` | No | Optional git remote URL. Used for display purposes — DarkTitan does not clone or push automatically. Pass an empty string if unused. |

**Response — 200 OK**

```json
{
  "id": "proj-a1b2c3d4",
  "name": "my-app",
  "local_dir": "/Users/alice/projects/my-app",
  "git_url": "",
  "created_at": "2026-03-23T12:00:00Z"
}
```

## GET /api/v1/projects

List all projects.

**Request**

```bash
curl http://localhost:7700/api/v1/projects
```

**Response — 200 OK**

```json
[
  {
    "id": "proj-a1b2c3d4",
    "name": "my-app",
    "local_dir": "/Users/alice/projects/my-app",
    "git_url": "",
    "created_at": "2026-03-23T12:00:00Z"
  },
  {
    "id": "proj-e5f6a7b8",
    "name": "api-service",
    "local_dir": "/Users/alice/projects/api-service",
    "git_url": "https://github.com/alice/api-service",
    "created_at": "2026-03-22T09:30:00Z"
  }
]
```

## GET /api/v1/projects/{id}

Get a single project by ID.

**Request**

```bash
curl http://localhost:7700/api/v1/projects/proj-a1b2c3d4
```

**Response — 200 OK**

```json
{
  "id": "proj-a1b2c3d4",
  "name": "my-app",
  "local_dir": "/Users/alice/projects/my-app",
  "git_url": "",
  "created_at": "2026-03-23T12:00:00Z"
}
```

## DELETE /api/v1/projects/{id}

Delete a project. This does not delete flow runs associated with the project.

**Request**

```bash
curl -X DELETE http://localhost:7700/api/v1/projects/proj-a1b2c3d4
```

**Response — 200 OK**

```json
{"ok": true}
```

> **Note:** Deleting a project removes the project record and its flow assignments but does not delete the flow definitions themselves (accessible via `GET /api/v1/flows/saved`) or any historical run data.

## POST /api/v1/projects/{id}/flows

Assign a saved flow definition to a project. Once assigned, the flow appears in the project's flow list and can be launched from the UI's project view.

**Request**

```bash
curl -X POST http://localhost:7700/api/v1/projects/proj-a1b2c3d4/flows \
  -H "Content-Type: application/json" \
  -d '{
    "flow_id": "f1a2b3c4-5678-90ab-cdef-111213141516"
  }'
```

**Response — 200 OK**

```json
{
  "project_id": "proj-a1b2c3d4",
  "flow_id": "f1a2b3c4-5678-90ab-cdef-111213141516",
  "assigned_at": "2026-03-23T12:05:00Z"
}
```

## GET /api/v1/projects/{id}/flows

List all flow definitions assigned to a project.

**Request**

```bash
curl http://localhost:7700/api/v1/projects/proj-a1b2c3d4/flows
```

**Response — 200 OK**

```json
[
  {
    "id": "f1a2b3c4-5678-90ab-cdef-111213141516",
    "name": "implement-review-test",
    "assigned_at": "2026-03-23T12:05:00Z"
  },
  {
    "id": "a9b8c7d6-5432-10fe-dcba-987654321000",
    "name": "hotfix-flow",
    "assigned_at": "2026-03-22T16:20:00Z"
  }
]
```
