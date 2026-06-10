# Stages

Stages are the building blocks of a DarkTitan flow. Each stage runs one AI agent with a specific prompt, evaluates the output through a gate, and either advances to the next stage or loops. This page covers every field in depth.

## name

Every stage requires a `name`. Names must be unique within a flow — DarkTitan uses them to identify stages in logs, API responses, and as loop targets. Use lowercase letters, digits, and hyphens. Keep names short and descriptive.

**Naming conventions**

```yaml
spec:
  stages:
    - name: plan          # good: short, lowercase, hyphenated
    - name: implement
    - name: review-code   # good: descriptive compound name
    - name: run-tests
```

> **Note:** Stage names cannot be changed after a flow run has started — the run's event log and database records reference the name as it existed at launch time.

## prompt

The `prompt` field is the instruction set sent to the AI agent. It determines everything the agent does: which files it reads, what it writes, which commands it runs, and what constitutes completion.

Use the YAML block scalar operator (`|`) to write multi-line prompts. Indentation within the block is preserved as literal newlines. The agent receives the prompt verbatim — what you write is what the agent reads.

### Vague prompt (avoid)

**Bad: vague prompt**

```yaml
- name: implement
  prompt: |
    Implement the feature.
```

This prompt gives the agent no guidance on where to look, what to write, or how to verify the result. The agent will make arbitrary decisions and the output will be inconsistent between runs.

### Well-written prompt

**Good: specific, actionable prompt**

```yaml
- name: implement
  prompt: |
    Read TASK.md to understand the full requirements.

    Implement the feature described there using idiomatic Go:
    - Follow the existing package structure in internal/
    - Add unit tests in the _test.go file alongside each package you modify
    - Run `go build ./...` and `go test ./...` before finishing
    - Update README.md if you add or change any public API or CLI flags

    The implementation is complete when all tests pass and the build succeeds.
```

This prompt specifies exactly where to look for requirements (`TASK.md`), where to put code (`internal/`), what verification steps to run, and a clear definition of done.

### Multi-step evaluation prompt

**Review stage with structured output**

```yaml
- name: review
  prompt: |
    You are reviewing a pull request. The changes were made by the implement stage.

    Evaluate the implementation against the requirements in TASK.md:
    1. Does it fulfil all acceptance criteria?
    2. Are there any obvious bugs or edge cases not handled?
    3. Is error handling appropriate?
    4. Are tests meaningful (not just coverage padding)?

    Write your findings to REVIEW.md. Use this format:

    ## Summary
    One paragraph overall assessment.

    ## Issues
    List each issue as: [BLOCKING|SUGGESTION] description

    ## Decision
    Either PASS or FAIL, with one sentence justification.
```

> **Note:** Write prompts as if instructing a capable but context-free contractor. Assume the agent knows nothing about your project other than what you tell it in the prompt and what it discovers by reading files. The more specific you are, the more consistent the output.

### Best practices

- Reference specific files by name (`TASK.md`, `README.md`)
- Specify the exact commands to run for build and test verification
- Define a clear completion criterion ("when all tests pass", "when REVIEW.md is written")
- For review stages, provide a structured output format so the gate evaluator has consistent input
- Mention architectural constraints the agent should respect (package layout, naming conventions)
- Keep each stage prompt focused on one responsibility — avoid combining implement + review in a single stage

## gate_type

The `gate_type` field controls how a stage's output is evaluated. If the gate passes, the flow advances to the next stage. If it fails, the stage loops (or escalates if the iteration limit is reached).

**All four gate_type values**

```yaml
# auto-pass: no evaluation, always advances
- name: plan
  prompt: |
    Read the codebase and write a PLAN.md outlining your implementation approach.
  gate_type: auto-pass

# ai-evaluation: Claude reviews the output
- name: implement
  prompt: |
    Implement the feature described in PLAN.md.
  gate_type: ai-evaluation
  max_iterations: 5

# test-results: pass/fail based on test suite exit code
- name: test
  prompt: |
    Run the test suite and fix any failures.
  gate_type: test-results
  max_iterations: 3

# manual: waits for a human gate-override API call
- name: security-review
  prompt: |
    Produce a security analysis report in SECURITY.md.
  gate_type: manual
```

See the [Gates](/docs/yaml/gates) page for a full deep dive on each type, including how to write prompts that work well with ai-evaluation.

## max_iterations

`max_iterations` sets the upper bound on how many times a stage can run before its `escalation` policy fires. The default is `10`.

Each time a gate fails, that counts as one iteration. The first run of the stage is iteration 1. If `max_iterations: 3`, the stage can fail twice and run a third time — if the gate still fails on the third run, the escalation policy triggers.

**max_iterations with pause escalation**

```yaml
- name: implement
  prompt: |
    Implement the described feature with full test coverage.
  gate_type: ai-evaluation
  max_iterations: 5    # try up to 5 times before escalating
  escalation: pause    # pause and wait for human when limit hit
```

Set `max_iterations` based on how hard the task is and how much work each loop is likely to accomplish. Simple tasks with reliable gates can use low values (2–3). Complex implementation stages where each loop makes meaningful progress can use higher values (5–10).

> **Warning:** Very high `max_iterations` values (above 15) can lead to long-running flows that consume significant API budget. Prefer lower limits with a `pause` or `notify` escalation so you can intervene rather than letting a stuck stage spin indefinitely.

## escalation

When a stage exhausts its `max_iterations` without the gate passing, the `escalation` policy determines what happens next.

**All four escalation values in context**

```yaml
# pause: stop and wait — good for interactive development
- name: implement
  gate_type: ai-evaluation
  max_iterations: 5
  escalation: pause

# abort: hard stop — good for CI where a bad result should fail the pipeline
- name: test
  gate_type: test-results
  max_iterations: 3
  escalation: abort

# notify: keep going but record the escalation — good for non-critical stages
- name: lint
  gate_type: test-results
  max_iterations: 2
  escalation: notify

# ai-decide: let Claude decide — good default for most situations
- name: review
  gate_type: ai-evaluation
  max_iterations: 4
  escalation: ai-decide
```

| Value | Best for |
|---|---|
| `pause` | Interactive development where you want to inspect and guide |
| `abort` | CI pipelines where a stuck stage should fail the whole run |
| `notify` | Non-critical stages where you want to log but not block |
| `ai-decide` | General use — sensible default when you are unsure |
