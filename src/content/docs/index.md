# DarkTitan Documentation

DarkTitan is an autonomous software pipeline tool. Write a YAML flow,
point it at your codebase, and let Claude Code agents execute each stage — implement, review,
test, refactor — without interruption.

## What is DarkTitan?

Most AI coding tools are interactive: you write a prompt, the AI responds, you review, iterate.
DarkTitan is different. It is a **pipeline runner**. You define the work once in a
YAML flow file — the stages, the prompts, the quality gates — and DarkTitan executes the whole
thing from start to finish on its own.

Under the hood, DarkTitan spawns Claude Code as a subprocess for each stage in your flow. The
agent reads your codebase, executes the stage prompt, writes files, runs tests, and produces
output. DarkTitan then evaluates the gate condition (AI review, test suite pass, or your manual
approval) and either advances to the next stage, loops the current one, or escalates to you.

The result is a workflow that runs while you sleep, that can implement a feature, review its own
output, fix issues, and open a pull request — all from a single `darktitan run` command.

## Key concepts

| Concept | Description |
|---|---|
| [`Flow`](/docs/concepts/flows) | A YAML file that defines the full pipeline — a named sequence of stages with prompts, gates, and loops. |
| [`Stage`](/docs/concepts/stages) | A single unit of work inside a flow. Each stage runs one Claude Code agent with a specific prompt. |
| [`Gate`](/docs/concepts/gates) | A quality checkpoint between stages. Gates can be AI-evaluated, human-approved, or test-passing. |
| [`Loop`](/docs/concepts/gates) | Automatic retry logic that re-runs a stage (up to a configured limit) until the gate passes. |
| [`Agent`](/docs/concepts/agents) | A Claude Code subprocess spawned by DarkTitan for each stage. Agents run autonomously in your codebase. |
| [`Project`](/docs/concepts/projects) | A named workspace pointing to a local directory. Flows are assigned to projects before running. |

## Quick links

- [Getting Started](/docs/getting-started): Install DarkTitan, set up your API key, and run your first pipeline in minutes.
- [Quick Start](/docs/quick-start): End-to-end walkthrough: create a project, write a flow, assign it, and watch it run.
- [CLI Reference](/docs/cli): Every command explained — init, run, assign, status, logs, ui, and more.
- [YAML Reference](/docs/yaml): Full schema documentation for flow files, stages, gates, and loop configuration.
- [API Reference](/docs/api): REST API docs for the DarkTitan server running on port 7700.
- [Guides](/docs/guides/first-flow): Practical recipes: multi-stage pipelines, gate strategies, and real-world flow patterns.
