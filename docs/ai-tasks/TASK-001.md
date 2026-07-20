# TASK-001 — Initialize the empty FlexSavvy repository

| Field | Value |
|---|---|
| Phase | 0 — Fresh start initialization |
| Parent milestone | Repository creation |
| Risk | low |
| Network policy | `none` |
| Dependencies | None |
| Suggested commit | `task-001: initialize-fresh-start-repository` |

## Complete prompt

You are Qwen3.6-27B acting as the senior engineer for a new FlexSavvy repository.

Execute **TASK-001 only**. Do not start another task.

### Objective

Turn the current empty task-pack directory into a clean Git repository with explicit fresh-start boundaries and progress tracking.

### Mandatory preparation

1. Read `AGENTS.md`, `docs/AI_WORKFLOW.md`, `docs/AI_TASK_INDEX.md` and this task file.
2. Run `pwd`, `whoami`, `find . -maxdepth 3 -type f | sort` and `git status --short`.
3. Confirm that no application source, package manifest, build output or old Git history is present.
4. If legacy project code is present, stop and report it. Do not delete it automatically.
5. State a concise plan before editing.

### Required implementation

1. Initialize Git when `.git/` is absent.
2. Use `main` as the initial branch.
3. Create `.gitignore` covering Node dependencies, Astro output, test artifacts, environment files, editor files, logs, temporary catalogue generations and private validation datasets.
4. Create `docs/PROGRESS.md` with:
   - project state;
   - completed tasks;
   - decisions;
   - command evidence;
   - known risks;
   - next task.
5. Create `docs/DECISIONS.md` with an ADR-style template.
6. Create `private-data/README.md` explaining that real smart-meter data must not be committed; ignore the directory contents except the README.
7. Add a root `README.md` stating that this is a fresh-start, privacy-first, static UK household electricity flexibility simulator and that implementation is controlled by `docs/AI_TASK_INDEX.md`.
8. Do not create application code or `package.json`.

### Explicitly out of scope

- Astro or React initialization.
- Product specification.
- Dependencies.
- GitHub remote creation.
- Commit, push or pull request.
- Importing old FlexSavvy files.

### Required verification

- Confirm the branch is `main`.
- Confirm ignored private sample files would not be tracked.
- Confirm only governance and task-pack files are changed.
- Confirm all task files TASK-001 through TASK-114 exist.

### Commands that must be run

```bash
pwd
whoami
git init -b main
git branch --show-current
git status --short
find . -maxdepth 3 -type f | sort
git check-ignore -v private-data/example-private.csv
git diff --check
```

Create `private-data/example-private.csv` only temporarily for the ignore check, then remove it.

### Completion gate

Do not claim completion unless:

- the directory is a new Git repository on `main`;
- no legacy application code is present;
- private datasets are ignored;
- `docs/PROGRESS.md` records actual command output;
- TASK-001 is marked `DONE` in `docs/AI_TASK_INDEX.md`;
- the final response contains `git status --short`.

### Response format

Report exactly:

1. **Files changed**
2. **Repository initialized**
3. **Verification performed**
4. **Commands executed and actual results**
5. **Assumptions**
6. **Remaining risks**
7. **Suggested commit message**
8. **`git status --short`**

Do not commit or push.
