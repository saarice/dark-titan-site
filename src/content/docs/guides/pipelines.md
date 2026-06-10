# Multi-Stage Pipelines

A well-designed pipeline separates concerns across stages, passes context through files,
and applies gates only where they add value. This guide walks through a production-grade
four-stage pipeline and the principles behind it.

## The four-stage pattern: Plan → Implement → Test → Review

This is the most common pipeline structure for feature development. Each stage has a single responsibility:

- **Plan** — reads the task spec and produces a structured plan file. No gate needed; the plan's quality will be validated implicitly by the implement stage.
- **Implement** — reads the plan and writes the code. An AI evaluation gate catches structural issues before the test stage.
- **Test** — runs the test suite. A `test-results` gate gives an objective pass/fail. Test failures loop back to implement.
- **Review** — performs a final review against the task spec. A structured output format makes the AI evaluation gate reliable.

## Complete pipeline YAML

**feature-pipeline.yaml**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: feature-pipeline
spec:
  stages:
    - name: plan
      prompt: |
        Read TASK.md and the existing codebase to understand the change needed.

        Produce PLAN.md with:
        ## Summary
        One paragraph describing the approach.

        ## Files to change
        A list of files you will modify or create, with a one-line note on each.

        ## Risks
        Any edge cases, migration concerns, or unknowns.

        ## Verification
        How you will know the implementation is correct (tests to write, commands to run).
      gate_type: auto-pass

    - name: implement
      prompt: |
        Read PLAN.md and implement the changes described there.

        Guidelines:
        - Follow the existing code style and package structure
        - Write unit tests for every new function or method
        - Write an integration test if the change touches the HTTP layer
        - Run `go build ./...` and `go test ./...` before finishing
        - Both must succeed with zero failures

        Context from previous stages: PLAN.md is available in the project root.
      gate_type: ai-evaluation
      max_iterations: 5
      escalation: pause

    - name: test
      prompt: |
        Run the full test suite with `go test -race ./...`.

        If any tests fail:
        1. Read the failure output carefully
        2. Open the relevant source file
        3. Fix the root cause in the implementation — do not modify test assertions
        4. Re-run until all tests pass

        Context from previous stages: implementation is complete. PLAN.md is available.
      gate_type: test-results
      max_iterations: 4
      escalation: abort
      loop_target_stage: implement

    - name: review
      prompt: |
        Perform a final code review of the implementation against TASK.md.

        Review checklist:
        1. All acceptance criteria in TASK.md are satisfied
        2. No obvious bugs or unhandled error paths
        3. Tests are meaningful and not just coverage padding
        4. No hardcoded values that should be configuration
        5. Code is readable — another developer could maintain it

        Read PLAN.md for the original intent if anything is unclear.

        Write REVIEW.md:
        ## Findings
        List each issue as [BLOCKING] or [SUGGESTION] with a description.

        ## Decision
        DECISION: PASS
        or
        DECISION: FAIL — <reason>
      gate_type: ai-evaluation
      max_iterations: 2
      escalation: pause
      loop_target_stage: implement
```

## Passing context between stages

DarkTitan stages do not pass data directly to each other — they share a common working directory. The primary mechanism for inter-stage context is files written to that directory.

**Using files to pass context**

```yaml
# Stage 1 writes a plan file
- name: plan
  prompt: |
    Write PLAN.md with your implementation approach.
  gate_type: auto-pass

# Stage 2 reads the plan file
- name: implement
  prompt: |
    Read PLAN.md and implement the changes described there.
    ...

# Stage 3 reads both plan and a review file written by stage 4 if looping
- name: test
  prompt: |
    Run go test ./...
    If tests fail, read the failure output and PLAN.md for context.
    Fix the implementation.
  loop_target_stage: implement
```

Common context files:

| File | Written by | Read by | Purpose |
|---|---|---|---|
| `TASK.md` | You (before the flow) | All stages | Feature spec and acceptance criteria |
| `PLAN.md` | plan stage | implement, test, review | Implementation approach and file list |
| `REVIEW.md` | review stage | Gate evaluator | Structured review findings and DECISION |

Instruct each stage explicitly to read the relevant files at the start of its prompt. The agent has no memory of previous stages — it starts fresh each time and discovers context by reading the filesystem.

## When to use gates on which stages

**Gate type selection guide**

```text
Stage       Recommended gate_type    Why
─────────   ──────────────────────   ──────────────────────────────────────────────
plan        auto-pass                Plans are hard to evaluate; quality shows in
                                     the implement stage.
implement   ai-evaluation            Catches logic errors, missing edge cases,
                                     and incomplete test coverage.
test        test-results             Binary: tests pass or they don't. No
                                     interpretation needed.
review      ai-evaluation            Structured REVIEW.md with explicit DECISION
                                     line makes evaluation reliable.
deploy      manual                   Human sign-off before touching production.
```

> **Warning:** Do not add gates to every stage. Gates add latency (each AI evaluation is an additional API call) and can create excessive loops that consume budget without adding value. Reserve gates for stages where a bad output would cause real problems downstream — typically implement, test, and review. Scaffolding and planning stages rarely need gates.

## Tips for writing stage prompts that build on previous stages

- **Name the context file explicitly.** Write "Read PLAN.md" rather than "use the plan from the previous stage". The agent has no awareness of stage order.
- **Set a clear completion criterion.** Every stage prompt should end with an unambiguous condition that tells the agent when to stop: "when all tests pass", "when REVIEW.md contains a DECISION line".
- **Reference verification commands by name.** "Run `go test ./...`" is more reliable than "run the tests".
- **Repeat critical constraints in every stage.** If your project has a no-modify-tests rule, state it in both implement and test stage prompts. Do not assume context carries over.
- **Keep each stage focused.** A stage that plans, implements, tests, and reviews is hard for the agent to complete reliably and hard for the gate to evaluate. Split it.
