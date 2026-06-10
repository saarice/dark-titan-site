# Loops

When a gate fails, DarkTitan does not give up — it loops. The stage (or an earlier stage) re-runs with feedback about why the gate failed. This iterative refinement is the core mechanism that turns a single agent pass into a reliable, self-correcting pipeline.

## Loop mechanics

After each gate evaluation, DarkTitan takes one of two paths:

- **Gate passes:** advance to the next stage in the list.
- **Gate fails:** increment the iteration counter, then re-run either the current stage or the stage named in `loop_target_stage`. The agent receives the gate's failure rationale as additional context so it can adjust.

When the stage re-runs after a loop, the agent's context includes the original prompt plus a record of the gate failure from the previous iteration. This gives the agent the information it needs to address the specific issue the gate flagged.

## Self-loop (default)

When `loop_target_stage` is empty or omitted, a failing gate causes the current stage to re-run. This is the most common pattern — an implement stage loops on itself until the gate passes.

**Self-loop: implement retries itself**

```yaml
- name: implement
  prompt: |
    Implement the feature described in TASK.md.
    Run `go test ./...` before finishing and ensure all tests pass.
  gate_type: ai-evaluation
  max_iterations: 5
  escalation: pause
  # loop_target_stage omitted — loops back to "implement" itself
```

## Cross-stage loops with loop_target_stage

Set `loop_target_stage` to the name of an earlier stage to loop back further in the pipeline. When a later stage's gate fails, execution jumps back to the named stage and re-runs from there.

The classic pattern is **plan → implement → test** where a test failure sends the flow back to **implement** rather than test, since the fix belongs in the implementation — not in re-running a test that is already correct.

**plan-implement-test.yaml — test loops back to implement**

```yaml
apiVersion: darktitan.io/v1
kind: Flow
metadata:
  name: plan-implement-test
spec:
  stages:
    - name: plan
      prompt: |
        Read TASK.md and the existing codebase.
        Write PLAN.md with a detailed implementation plan.
      gate_type: auto-pass

    - name: implement
      prompt: |
        Read PLAN.md and implement the described changes.
        Add unit tests. Run `go test ./...` before finishing.
      gate_type: ai-evaluation
      max_iterations: 5
      escalation: pause

    - name: test
      prompt: |
        Run the full test suite with `go test ./...`.
        If tests fail, investigate and fix the root cause.
        Do not modify tests to make them pass — fix the implementation.
      gate_type: test-results
      max_iterations: 4
      escalation: abort
      loop_target_stage: implement   # test failure loops back to implement
```

In this example, when the `test` stage's gate fails, DarkTitan runs the `implement` stage again with the test failure output as additional context. The implement stage's own iteration counter is not incremented by this — only the test stage's counter increases. Each stage tracks its own iteration count independently.

> **Note:** `loop_target_stage` must name a stage that appears *earlier* in the stages list. Looping forward (to a later stage) is not supported and will cause a validation error at flow load time.

## max_iterations and escalation interplay

Each stage has its own `max_iterations` counter that is independent of other stages. When a stage's counter is exhausted, the `escalation` policy on that stage fires — regardless of which stage triggered the loop.

**Iteration counting and escalation**

```yaml
- name: implement
  prompt: |
    Implement the feature in TASK.md.
  gate_type: ai-evaluation
  max_iterations: 3     # tries: 1, 2, 3 — escalates after 3rd fail
  escalation: pause     # on escalation: pause and wait for human
```

In the **plan → implement → test** example above:

- The `test` stage has `max_iterations: 4`. Each time the test gate fails, `test`'s counter increments and the flow loops back to `implement`.
- After 4 test failures, the `test` stage escalates with `abort` — the flow terminates.
- The `implement` stage has its own `max_iterations: 5`. If the implement gate fails on its own (not via a test loop), implement escalates independently.

> **Note:** When designing cross-stage loops, set `max_iterations` on the downstream stage (the one with `loop_target_stage`) to control how many full loop cycles the pipeline will attempt. The upstream target stage's counter is not affected by loops triggered from downstream.

## Anti-patterns to avoid

### Deep chained loops

Avoid setting up chains where stage C loops to B, and B loops to A. While technically valid, these chains are difficult to reason about and make iteration counts hard to predict. Prefer looping back one stage at most.

**Avoid: nested chain loops**

```yaml
# AVOID: looping to a stage that itself loops to an even earlier stage
# creates hard-to-reason-about cycles

spec:
  stages:
    - name: plan
      ...
    - name: implement
      loop_target_stage: plan   # loops back to plan on fail
      ...
    - name: test
      loop_target_stage: implement  # fine: test loops back to implement
      ...
```

### Forward loops

**Avoid: loop_target_stage pointing forward**

```yaml
# AVOID: loop_target_stage pointing to a later stage — not supported
spec:
  stages:
    - name: implement
      loop_target_stage: test   # ERROR: cannot loop forward
    - name: test
      ...
```

### Excessively high max_iterations

Setting `max_iterations` above 10–15 rarely helps — if an agent has not solved the problem in 5 iterations, more iterations without human guidance usually do not fix it. Use a `pause` escalation instead and intervene.

**Avoid: very high max_iterations**

```yaml
# AVOID: very high max_iterations without a sensible escalation
- name: implement
  gate_type: ai-evaluation
  max_iterations: 50   # 50 iterations before giving up is almost always too many
  escalation: abort    # if it hasn't passed in 50 tries, aborting loses all context
```

**Better: pause and guide**

```yaml
# BETTER: lower iterations, pause on escalation so a human can guide
- name: implement
  gate_type: ai-evaluation
  max_iterations: 5
  escalation: pause
```
