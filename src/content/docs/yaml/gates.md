# Gates

A gate is the evaluation step that runs after each stage completes. It decides whether the stage output is good enough to advance the flow — or whether the agent should loop and try again. Choosing the right gate type and writing clear prompts are the keys to reliable flows.

## Gate evaluation process

Every stage follows this sequence:

1. The agent runs with the stage prompt.
2. The agent exits (success or failure).
3. DarkTitan evaluates the gate according to `gate_type`.
4. If the gate **passes**: the flow advances to the next stage.
5. If the gate **fails** and `max_iterations` has not been reached: the stage loops back to the target stage (default: itself) and the agent runs again.
6. If the gate **fails** and `max_iterations` is exhausted: the `escalation` policy fires.

The agent receives gate feedback on each loop — it is told whether the gate passed or failed and, where available, the rationale. This allows the agent to adapt its approach on each iteration.

## auto-pass

The simplest gate — it always passes immediately after the agent completes. No evaluation happens. Use `auto-pass` for stages where correctness is verified by a later stage, or where you trust the agent's output unconditionally.

**auto-pass example**

```yaml
- name: plan
  prompt: |
    Read the codebase and TASK.md.
    Write a PLAN.md with your implementation approach: which files to change,
    what new types or functions to introduce, and the order of changes.
  gate_type: auto-pass
```

Planning and scaffolding stages are common candidates for `auto-pass`. A plan stage that writes `PLAN.md` does not need gate evaluation — the implement stage that follows will naturally catch any planning errors.

## ai-evaluation

DarkTitan spawns a second Claude instance to evaluate the stage output. The evaluator reads the stage prompt, the agent's work, and relevant project files, then returns a PASS or FAIL decision with a written rationale.

**ai-evaluation on an implement stage**

```yaml
- name: implement
  prompt: |
    Read PLAN.md and implement the changes described there.
    Follow the existing code style. Add tests. Run `go test ./...` before finishing.
  gate_type: ai-evaluation
  max_iterations: 5
  escalation: ai-decide
```

### What the evaluator looks for

Without a dedicated review stage, the evaluator uses the stage `prompt` as its rubric. It checks whether the agent fulfilled the instructions. This works for simple stages but can produce inconsistent results for complex ones.

For best results with `ai-evaluation`, add a preceding review stage whose prompt provides explicit evaluation criteria and writes a structured report that the evaluator can read:

**Review stage designed for ai-evaluation**

```yaml
- name: review
  prompt: |
    Review the changes made by the implement stage against TASK.md.

    Evaluate:
    1. Does the implementation satisfy all acceptance criteria in TASK.md?
    2. Are all new functions covered by tests?
    3. Does `go test ./...` pass?
    4. Is there any obviously broken logic or unhandled error?

    Write REVIEW.md with your findings. Your final line must be either:
      DECISION: PASS
    or:
      DECISION: FAIL — <one line reason>
  gate_type: ai-evaluation
  max_iterations: 3
```

### Writing prompts that work well with ai-evaluation

- **Define a structured output format.** When the agent writes a report with a clear `DECISION: PASS` or `DECISION: FAIL` line, the evaluator has an unambiguous signal to parse.
- **List explicit criteria.** Numbered evaluation checklists give the evaluator clear items to verify rather than asking it to infer what "good" means.
- **Reference specific files.** Tell the agent (and the evaluator) exactly which files constitute the deliverable. Ambiguity leads to inconsistent evaluation.
- **Avoid vague success conditions.** "Write good code" is not a criterion. "All tests pass and no new lint errors" is.

> **Note:** The evaluator sees the same project directory as the agent. If your review stage writes a structured `REVIEW.md`, the evaluator can read it directly and make a high-confidence decision.

## test-results

DarkTitan runs the project's configured test command and evaluates the exit code. Exit 0 is PASS; any non-zero exit is FAIL. The full test output is captured and fed back to the agent on each loop so it can diagnose failures.

**test-results with Node.js**

```yaml
- name: test
  prompt: |
    Run `npm test` and fix any failing tests.
    Do not skip tests or modify test assertions to make them pass.
    The implementation must satisfy the existing test suite.
  gate_type: test-results
  max_iterations: 4
  escalation: abort
```

**test-results with Go**

```yaml
- name: test
  prompt: |
    Run `go test ./...` and resolve any failures.
    Do not skip test cases. Fix the underlying implementation, not the tests.
  gate_type: test-results
  max_iterations: 3
  escalation: abort
```

The stage prompt should instruct the agent to run the test command itself and fix failures. On subsequent loops, the agent receives the captured output from the failed test run as additional context.

> **Warning:** Ensure your project has a test command configured. DarkTitan looks for a `test` script in `package.json` for Node.js projects and runs `go test ./...` for Go projects. If neither is found, the gate will error.

## manual

The flow pauses after the agent completes and waits for a human to call the gate-override API endpoint. Use this for compliance checkpoints, security reviews, or any step that requires a human decision before proceeding.

**manual gate on a security-review stage**

```yaml
- name: security-review
  prompt: |
    Audit the changes in this pull request for security issues.
    Write a SECURITY-REVIEW.md covering:
    - Input validation
    - Authentication and authorisation
    - Injection risks (SQL, shell, path traversal)
    - Secrets handling
    Summarise your findings and flag any BLOCKING issues.
  gate_type: manual
```

When the gate is waiting, the flow status shows `AWAITING_GATE`. Submit your decision using the gate-override endpoint:

**Submitting a gate-override decision**

```bash
curl -X POST http://localhost:7700/api/v1/flows/FLOW_ID/stages/security-review/gate-override \
  -H "Content-Type: application/json" \
  -d '{"decision": "PASS", "rationale": "Reviewed SECURITY-REVIEW.md — no blocking issues found."}'
```

The `decision` field accepts `PASS` or `FAIL`. If you submit `FAIL`, the stage loops (if iterations remain) or escalates. The `rationale` string is shown in the event log and fed back to the agent.

See [API: Stages](/docs/api/stages) for the full gate-override endpoint reference.
