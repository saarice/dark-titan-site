# Gate Strategies

Choosing the right gate type, writing evaluation prompts that produce consistent decisions,
and calibrating `max_iterations` and `escalation` are the skills
that separate unreliable flows from ones you can trust. This guide covers all of them.

## When to use auto-pass

Use `auto-pass` when the output of a stage is either trivially verifiable or will be implicitly validated by a downstream stage. Planning, scaffolding, and documentation stages are common examples.

**Good auto-pass candidates**

```yaml
# Good candidates for auto-pass
- name: plan
  prompt: |
    Read TASK.md and write PLAN.md.
  gate_type: auto-pass      # plan quality validates itself in implement

- name: scaffold
  prompt: |
    Create the directory structure and empty files described in PLAN.md.
  gate_type: auto-pass      # structural scaffolding, no logic to evaluate

- name: document
  prompt: |
    Read the implementation and update README.md.
  gate_type: auto-pass      # docs are soft; review is the quality gate
```

The key question: *if this stage produces bad output, will a later gate catch it?* If yes, `auto-pass` is usually fine. If a bad output here would silently corrupt the rest of the pipeline, add a gate.

## Writing good ai-evaluation gate prompts

The quality of `ai-evaluation` depends entirely on how clear your evaluation criteria are. The evaluator receives the stage prompt and the agent's work — it uses the prompt as its rubric.

**Avoid: vague evaluation criteria**

```yaml
- name: implement
  prompt: |
    Implement the feature. Make sure it is good.
  gate_type: ai-evaluation  # ← "good" is not a criterion — evaluation will be inconsistent
```

**Good: verifiable, specific criteria**

```yaml
- name: implement
  prompt: |
    Read TASK.md and implement the feature.
    Run `go test ./...` — all tests must pass.
    Run `go vet ./...` — no warnings.
    Verify all acceptance criteria in TASK.md are met.
  gate_type: ai-evaluation
  # The evaluator checks: tests pass, vet clean, acceptance criteria met
  # All three are verifiable — evaluation will be consistent
```

The best AI evaluation prompts share these properties:

- **Verifiable criteria.** "Tests pass" is verifiable. "Code is clean" is not.
- **Specific commands.** Name the exact commands the agent should run to verify its work. The evaluator will check whether they were run and what the output was.
- **Reference TASK.md.** When acceptance criteria live in a file, the evaluator can read them. This externalises the rubric and makes it consistent across runs.

### Using a review stage for reliable ai-evaluation

The most reliable pattern for `ai-evaluation` is a dedicated review stage that writes a structured output file with an explicit DECISION line:

**Review stage with structured output**

```yaml
- name: review
  prompt: |
    Review the implementation against TASK.md.

    Evaluate each acceptance criterion explicitly:
    1. [criterion 1] — PASS or FAIL with evidence
    2. [criterion 2] — PASS or FAIL with evidence
    ...

    Write REVIEW.md. Final line must be:
      DECISION: PASS
    or:
      DECISION: FAIL — <specific reason>
  gate_type: ai-evaluation
  # The evaluator reads REVIEW.md and finds the DECISION line — unambiguous
```

When the gate evaluator finds a clear `DECISION: PASS` or `DECISION: FAIL` line in `REVIEW.md`, it has an unambiguous signal. This approach is more consistent than asking the evaluator to infer a pass/fail from prose output.

## Setting appropriate max_iterations

**max_iterations examples by task complexity**

```yaml
# Tight: simple task, fast iterations
- name: scaffold
  gate_type: ai-evaluation
  max_iterations: 2     # scaffolding should not need many tries

# Moderate: typical implementation
- name: implement
  gate_type: ai-evaluation
  max_iterations: 5     # 5 tries is ample for most features

# Higher: complex refactoring with many moving parts
- name: refactor
  gate_type: ai-evaluation
  max_iterations: 8     # more iterations for genuinely hard tasks

# Keep it bounded: use pause, not high numbers
- name: implement
  gate_type: ai-evaluation
  max_iterations: 5     # try 5 times, then pause
  escalation: pause     # a human can guide from here
```

Rules of thumb:

- Simple, bounded tasks (scaffolding, documentation): 2–3
- Typical implementation: 4–6
- Complex refactoring or multi-file changes: 6–8
- Anything above 10 is almost always a sign that the task needs to be broken up

> **Note:** If a stage consistently reaches its iteration limit, the problem is usually one of three things: the task is too large for one stage, the prompt is too vague, or the gate criteria are unrealistic. Fix the flow, not the iteration count.

## Escalation strategies by scenario

### CI pipeline — fail fast

In a CI context, a stuck stage should fail the pipeline loudly so it can be fixed and re-run. Use `abort` escalation throughout.

**CI pipeline — abort on escalation**

```yaml
# CI pipeline — fail fast, no human in the loop
spec:
  stages:
    - name: implement
      gate_type: ai-evaluation
      max_iterations: 3
      escalation: abort       # CI should fail definitively

    - name: test
      gate_type: test-results
      max_iterations: 3
      escalation: abort       # failing tests = failing pipeline

    - name: review
      gate_type: ai-evaluation
      max_iterations: 2
      escalation: abort
```

### Interactive development — pause and guide

When developing locally, a `pause` escalation lets you inspect what the agent produced, make targeted edits, and resume. This is far more productive than an abort.

**Interactive development — pause on escalation**

```yaml
# Interactive development — pause and guide
spec:
  stages:
    - name: implement
      gate_type: ai-evaluation
      max_iterations: 5
      escalation: pause       # stop and let me look at it

    - name: test
      gate_type: test-results
      max_iterations: 4
      escalation: pause       # don't abort — I might want to fix manually

    - name: review
      gate_type: ai-evaluation
      max_iterations: 3
      escalation: pause
```

### Non-critical stages — notify

For stages where a failure is notable but not blocking, use `notify`. The escalation is logged to the event stream and the flow continues.

**Non-critical stage — notify on escalation**

```yaml
# Non-critical documentation stage
- name: update-changelog
  gate_type: ai-evaluation
  max_iterations: 2
  escalation: notify    # log the issue, keep the pipeline moving
```

## Real-world configuration

This is a complete, production-ready flow combining all the strategies above: auto-pass for planning, ai-evaluation with pause escalation for implementation, test-results with abort for CI-style test gating, and a manual gate for security sign-off.

**production-feature.yaml — complete example**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: production-feature
spec:
  stages:
    - name: plan
      prompt: |
        Read TASK.md. Write PLAN.md with your approach, files to change, and risks.
      gate_type: auto-pass

    - name: implement
      prompt: |
        Read PLAN.md and implement. Run `go test ./...` before finishing.
        All tests must pass.
      gate_type: ai-evaluation
      max_iterations: 5
      escalation: pause

    - name: test
      prompt: |
        Run `go test -race ./...`. Fix failures in the implementation.
        Do not modify test assertions.
      gate_type: test-results
      max_iterations: 4
      escalation: abort
      loop_target_stage: implement

    - name: review
      prompt: |
        Review the implementation against TASK.md.
        Write REVIEW.md ending with DECISION: PASS or DECISION: FAIL — reason.
      gate_type: ai-evaluation
      max_iterations: 2
      escalation: pause
      loop_target_stage: implement

    - name: security-check
      prompt: |
        Audit the changes for: input validation, auth, injection risks, secrets.
        Write SECURITY.md with findings.
      gate_type: manual         # human must sign off
```
