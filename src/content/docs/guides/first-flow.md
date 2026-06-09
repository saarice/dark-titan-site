# Your First Flow

This tutorial walks through building a complete feature implementation flow from scratch.
You will write a task description, create a two-stage flow YAML, assign it to a project,
run it, and watch it self-correct when the gate catches a bug.

## What we are building

We have a Go HTTP API with a `GET /api/users` endpoint. We want to add pagination. The flow will have two stages: **implement** (writes the code) and **review** (evaluates it against acceptance criteria). If the review stage's gate fails, the flow loops back to implement.

## Step 1 — Write TASK.md

Before touching any YAML, write a `TASK.md` in the root of your project. This is the spec the agent will read. The quality of the output is directly proportional to the quality of this document.

**TASK.md**

```markdown
# Task: Add pagination to the /api/users endpoint

## Background
The GET /api/users endpoint currently returns all users in a single response.
As the dataset grows this is becoming slow and wasteful.

## Requirements
- Add `page` and `limit` query parameters (both optional, defaults: page=1, limit=20)
- Return a `meta` object in the response: `{ page, limit, total, pages }`
- Users array stays at the top level under the key `users`
- If `page` is out of range, return an empty `users` array (not a 404)
- Add or update tests in `handler_test.go` to cover the new behaviour

## Acceptance criteria
- `GET /api/users` returns first 20 users with correct meta
- `GET /api/users?page=2&limit=5` returns the correct slice
- `GET /api/users?page=999` returns `{"users":[],"meta":{...}}`
- All existing tests still pass
```

> **Note:** Keep TASK.md specific. Vague tasks — "add pagination" — produce vague code. Explicit acceptance criteria — "GET /api/users?page=999 returns an empty users array" — give the agent an unambiguous target and give the gate evaluator a clear rubric.

## Step 2 — Create the flow YAML

Create `add-pagination.yaml` in your project root (or anywhere — DarkTitan will find it when you assign it).

**add-pagination.yaml**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: add-pagination
spec:
  stages:
    - name: implement
      prompt: |
        Read TASK.md to understand the feature you need to implement.

        The codebase is a Go HTTP API. The users endpoint is in internal/handlers/users.go.
        The handler test file is internal/handlers/users_test.go.

        Implement the pagination feature as described in TASK.md:
        - Add page and limit query parameters with the specified defaults
        - Return the meta object in the response
        - Handle out-of-range page numbers gracefully

        Write tests covering all acceptance criteria in TASK.md.
        Run `go build ./...` and `go test ./...` before finishing.
        Both must succeed.
      gate_type: ai-evaluation
      max_iterations: 5
      escalation: ai-decide

    - name: review
      prompt: |
        Review the implementation produced by the implement stage.
        Compare it against the acceptance criteria in TASK.md.

        Check:
        1. Does GET /api/users return the first 20 users with a correct meta object?
        2. Does ?page=2&limit=5 return the right slice?
        3. Does ?page=999 return an empty users array (not a 404)?
        4. Do all tests pass (`go test ./...`)?
        5. Is the code idiomatic Go with appropriate error handling?

        Write REVIEW.md with your findings. End with either:
          DECISION: PASS
        or:
          DECISION: FAIL — <one line reason>
      gate_type: ai-evaluation
      max_iterations: 3
      escalation: pause
      loop_target_stage: implement
```

A few things to notice about this flow:

- The **implement** stage prompt names specific files (`internal/handlers/users.go`) so the agent does not have to search for them.
- It tells the agent exactly how to verify its work: `go build ./...` and `go test ./...`.
- The **review** stage ends with a structured `DECISION:` line — this gives the gate evaluator an unambiguous signal to parse.
- The review stage has `loop_target_stage: implement` — if the review gate fails, execution returns to the implement stage so the agent can fix the issue.

## Step 3 — Initialise and assign

**Set up the project**

```bash
# Navigate to your project
cd /Users/alice/projects/my-go-api

# Register with DarkTitan
darktitan init

# Copy the flow file into the project
cp ~/flows/add-pagination.yaml .
```

**Import the flow into the project and run it**

```bash
# Import the flow YAML into ~/.darktitan/flows/ and link it to the project
darktitan import flow add-pagination.yaml my-app

# Run it
darktitan run add-pagination
```

## Step 4 — Watch the live feed

Open a new terminal and follow the logs in real time:

```bash
darktitan logs run-a1b2c3d4 --follow
```

Or check status in another terminal:

**darktitan status output**

```bash
$ darktitan status

  ID             FLOW              STAGE       STATUS    ITER
  run-a1b2c3d4   add-pagination    implement   RUNNING   1
```

**Live log stream — implement stage running**

```text
$ darktitan logs run-a1b2c3d4 --follow

  [add-pagination / implement]  14:01:00Z  Agent SPAWNED (iteration 1)
  [add-pagination / implement]  14:01:01Z  Tool: Read(TASK.md)
  [add-pagination / implement]  14:01:02Z  Tool: Read(internal/handlers/users.go)
  [add-pagination / implement]  14:01:03Z  Tool: Read(internal/handlers/users_test.go)
  [add-pagination / implement]  14:01:08Z  Tool: Edit(internal/handlers/users.go)
  [add-pagination / implement]  14:01:14Z  Tool: Edit(internal/handlers/users_test.go)
  [add-pagination / implement]  14:01:20Z  Tool: Bash(go build ./...)
  [add-pagination / implement]  14:01:23Z  Tool: Bash(go test ./...)
  [add-pagination / implement]  14:01:26Z  Agent COMPLETED (exit 0)
  [add-pagination / implement]  14:01:27Z  Gate: ai-evaluation — evaluating...
```

## Step 5 — The gate catches a bug

On the first iteration, the implement stage completes but the gate evaluator finds a problem: the handler returns 404 for out-of-range pages instead of an empty array. The gate fails, DarkTitan feeds the rationale back to the agent, and the stage loops.

**Gate fails — stage loops**

```text
  [add-pagination / implement]  14:01:31Z  Gate: FAIL
                                            Rationale: TestPaginationOutOfRange expects status 200
                                            with empty users array, but handler returns 404 when
                                            page exceeds total pages.

  [add-pagination / implement]  14:01:31Z  Stage LOOPING → implement (iteration 2)
```

## Step 6 — The loop fixes it, flow completes

On iteration 2 the agent reads the failure rationale, opens `users.go`, finds the 404 branch, and changes it to return an empty array. The gate re-evaluates and passes. The flow moves on to the review stage, which also passes. Done.

**Iteration 2 passes — review passes — flow completes**

```text
  [add-pagination / implement]  14:01:32Z  Agent SPAWNED (iteration 2)
  [add-pagination / implement]  14:01:33Z  Tool: Read(internal/handlers/users.go)
  [add-pagination / implement]  14:01:37Z  Tool: Edit(internal/handlers/users.go)
  [add-pagination / implement]  14:01:42Z  Tool: Bash(go test ./...)
  [add-pagination / implement]  14:01:45Z  Agent COMPLETED (exit 0)
  [add-pagination / implement]  14:01:46Z  Gate: ai-evaluation — evaluating...
  [add-pagination / implement]  14:01:50Z  Gate: PASS
                                            Rationale: All acceptance criteria met. Tests pass.
                                            Out-of-range page returns empty array as required.

  [add-pagination / review]     14:01:51Z  Agent SPAWNED (iteration 1)
  [add-pagination / review]     14:01:52Z  Tool: Read(TASK.md)
  [add-pagination / review]     14:01:53Z  Tool: Read(internal/handlers/users.go)
  [add-pagination / review]     14:01:54Z  Tool: Bash(go test ./...)
  [add-pagination / review]     14:01:58Z  Tool: Write(REVIEW.md)
  [add-pagination / review]     14:02:00Z  Agent COMPLETED (exit 0)
  [add-pagination / review]     14:02:01Z  Gate: ai-evaluation — evaluating REVIEW.md...
  [add-pagination / review]     14:02:06Z  Gate: PASS
                                            Rationale: REVIEW.md: DECISION: PASS — implementation
                                            is correct and idiomatic.

  Flow COMPLETED in 1m 06s
```

The final output in `internal/handlers/users.go` now has correct pagination, `REVIEW.md` documents the findings, and all tests pass. The whole run took about a minute.

> **Note:** Your first few flows will likely need prompt tuning. If the agent misses a requirement, make the prompt more explicit. If the gate is too strict, add clearer evaluation criteria. Treat flow YAML the same as code — iterate on it.
