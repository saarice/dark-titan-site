# REST API Overview

DarkTitan exposes a REST API on port **7700** (default). The API lets you run flows, monitor execution in real time, manage projects, and submit gate decisions — everything the UI does is built on this API.

## Base URL

```text
http://localhost:7700
```

## Authentication

In local mode the API requires no authentication. All endpoints are accessible without tokens or headers. DarkTitan is designed for local use — it binds to `localhost` only and does not expose itself to the network by default.

> **Warning:** Do not expose the DarkTitan port to the public internet. There is no auth layer. If you need remote access, use an SSH tunnel or a private network.

## Content-Type

All request bodies must be JSON. Set `Content-Type: application/json` on every POST request. All responses are JSON unless otherwise noted (SSE is text/event-stream).

**Example POST with JSON body**

```bash
curl -X POST http://localhost:7700/api/v1/flows/run \
  -H "Content-Type: application/json" \
  -d '{"flow_id": "uuid", "local_dir": "/path/to/project"}'
```

## Health check

```bash
curl http://localhost:7700/health
```

**Response**

```json
{"status": "ok"}
```

## SSE event stream

Subscribe to real-time events for a running flow using Server-Sent Events at `GET /api/v1/events?flow_id=ID`. The connection stays open for the duration of the flow run and closes automatically when the flow completes or fails.

**Subscribe to events for a flow**

```bash
curl -N http://localhost:7700/api/v1/events?flow_id=FLOW_ID
```

**Example SSE stream**

```text
data: {"type":"stage_started","flow_id":"f1a2b3c4","stage":"implement","iteration":1,"ts":"2026-03-23T14:01:19Z"}

data: {"type":"stage_completed","flow_id":"f1a2b3c4","stage":"implement","iteration":1,"ts":"2026-03-23T14:01:58Z"}

data: {"type":"gate_evaluated","flow_id":"f1a2b3c4","stage":"implement","decision":"FAIL","rationale":"Tests still failing: 2 assertions","ts":"2026-03-23T14:01:59Z"}

data: {"type":"stage_looping","flow_id":"f1a2b3c4","stage":"implement","iteration":2,"loop_target":"implement","ts":"2026-03-23T14:01:59Z"}

data: {"type":"stage_started","flow_id":"f1a2b3c4","stage":"implement","iteration":2,"ts":"2026-03-23T14:02:00Z"}
```

### Event types

| Event type | Description |
|---|---|
| `stage_started` | An agent has started running for a stage (includes iteration number) |
| `stage_completed` | The agent for a stage has finished executing |
| `gate_evaluated` | A gate has been evaluated — includes decision (PASS/FAIL) and rationale |
| `stage_looping` | Gate failed and the flow is looping — includes target stage and iteration |
| `stage_escalated` | max_iterations exhausted — includes the escalation policy that fired |

## Endpoint reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/events?flow_id=ID` | SSE event stream for a running flow |
| `POST` | `/api/v1/flows/run` | Start a flow run |
| `GET` | `/api/v1/flows` | List all flow runs |
| `GET` | `/api/v1/flows/{id}/stages` | List stages for a flow run with status |
| `GET` | `/api/v1/flows/{id}/agents` | List agents spawned for a flow run |
| `POST` | `/api/v1/flows/{id}/pause` | Pause a running flow |
| `POST` | `/api/v1/flows/{id}/resume` | Resume a paused flow |
| `POST` | `/api/v1/flows/{id}/stop` | Stop and terminate a flow |
| `POST` | `/api/v1/flows/save` | Save a flow definition |
| `GET` | `/api/v1/flows/saved` | List saved flow definitions |
| `POST` | `/api/v1/projects` | Create a project |
| `GET` | `/api/v1/projects` | List all projects |
| `GET` | `/api/v1/projects/{id}` | Get a project by ID |
| `DELETE` | `/api/v1/projects/{id}` | Delete a project |
| `GET` | `/api/v1/projects/{id}/flows` | List flows assigned to a project |
| `POST` | `/api/v1/projects/{id}/flows` | Assign a flow to a project |
| `GET` | `/api/v1/blocks` | List available stage blocks |
| `GET` | `/api/v1/plugins` | List installed Claude Code plugins |
| `POST` | `/api/v1/flows/{flowID}/stages/{stageID}/gate-override` | Submit a manual gate decision |
| `POST` | `/api/v1/tickets` | Create a ticket. Body: `title`, `description`, `project_id`, optional `label` |
| `GET` | `/api/v1/tickets` | List all tickets. Optional query params: `status`, `project_id` |
| `GET` | `/api/v1/tickets/{id}` | Get a ticket by ID |
| `PATCH` | `/api/v1/tickets/{id}` | Update a ticket. Accepts `status`, `label`, `title`, `description` |
| `DELETE` | `/api/v1/tickets/{id}` | Delete a ticket |
| `GET` | `/api/v1/tickets/{id}/comments` | List agent and system comments on a ticket |
