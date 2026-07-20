# Qwen Fresh start Task Execution Workflow

This pack creates FlexSavvy from an empty directory. It does not audit, reuse or reconcile an older repository.

## Prepare an empty workspace

On the Ubuntu host:

```bash
mkdir -p /home/j/projects/flexsavvy
cd /home/j/projects/flexsavvy
```

Copy this pack's `AGENTS.md`, `MANUAL_ACTIONS.md` and `docs/` directory into that empty directory.

The directory may contain only those task-pack files before TASK-001 begins. Do not copy source code, package files, build output or Git history from an older project.

## Minimal instruction to Qwen

Start with:

> Read `AGENTS.md`, `docs/AI_WORKFLOW.md`, and `docs/ai-tasks/TASK-001.md`. Execute TASK-001 only. Do not start another task. Do not commit or push.

After TASK-001, proceed numerically:

> Read `AGENTS.md`, `docs/AI_WORKFLOW.md`, and `docs/ai-tasks/TASK-002.md`. Execute TASK-002 only. Do not start another task. Do not commit or push.

## Verification cycle

For every task:

1. Qwen reads only the permanent rules, current task, dependency outputs, relevant source files and tests.
2. Qwen states a concise plan.
3. Qwen implements one task.
4. Qwen runs the task's required commands.
5. Qwen updates `docs/PROGRESS.md` and `docs/AI_TASK_INDEX.md`.
6. Review the uncommitted diff:
   > Review the current uncommitted diff against TASK-XXX. Do not edit yet. Return only concrete findings with file and line references.
7. Ask Qwen to repair only accepted findings and rerun all commands.
8. Commit only when the repository is green.

## Commit instruction

> Commit the completed TASK-XXX changes with the suggested commit message. Do not push. Show the commit hash and final `git status --short`.

A new task should normally begin from a clean working tree.

## Context management for Qwen3.6-27B

- Use approximately 32K context initially.
- Start a fresh chat after each committed task or small, tightly related group.
- Never load the complete repository when targeted search is sufficient.
- Read the current task, its dependencies, relevant implementation files and relevant tests.
- Do not carry old implementation discussions forward as source of truth.
- Repository files and tests are the source of truth.

## Internet policy

Each task defines one policy:

- `none`: no external access.
- `packages`: package-registry access only.
- `fixture-only`: committed fixtures only; no live API.
- `limited-live`: only the named public API for a separately labelled validation command.
- `github`: only the exact repository action requested.

Automated tests must remain offline.

## Dependency rule

Tasks must run numerically unless a task file explicitly says otherwise.

When a dependency is not marked `DONE`, stop and report it. Do not bypass or recreate the dependency inside the current task.

## No legacy reuse

Do not:

- clone an older FlexSavvy repository;
- copy old source files into this project;
- use old commits as implementation evidence;
- mark a task complete because an older repository contained similar functionality.

External code may be used only as a dependency under its licence or when the user explicitly authorises a specific import.
