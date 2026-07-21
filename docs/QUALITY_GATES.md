# Quality Gates

Mandatory verification commands for every task. These gates enforce minimum quality before a task can be marked complete.

## Core Principle

**Quality gates may never be weakened to obtain a pass.** If code fails a gate, the code must be fixed — not the gate.

## Mandatory Commands Per Task

| Command | Purpose | When to Run |
|---------|---------|-------------|
| `git status --short` | Verify working tree state; identify uncommitted changes | Start and end of every task |
| `find . -maxdepth 3 -type f \| sort` | Confirm no unexpected files or directories were created | End of every task |
| `git diff --check` | Detect trailing whitespace, merge conflict markers, and other formatting issues | Before claiming completion |

## Commands When Application Source Exists (Phase 2+)

Once the repository contains TypeScript source code and tests, the following gates become mandatory in addition to the core commands above:

| Command | Purpose | Failure Action |
|---------|---------|----------------|
| `npx tsc --noEmit` | Strict type-checking with no errors | Fix all type errors before proceeding |
| `npx vitest run` | Full unit and integration test suite | All tests must pass; zero failures, zero unhandled errors |
| `npx astro check` | Astro-specific type and route validation | Fix all reported issues |

When E2E tests are available (Phase 3+):

| Command | Purpose | Failure Action |
|---------|---------|----------------|
| `npx playwright test` | Browser-based end-to-end scenarios | All scenarios must pass |

## Gate Rules

1. **All-or-nothing**: Every applicable gate must pass before a task is marked `DONE`. A single failure blocks completion.
2. **No selective disabling**: Gates may not be disabled, skipped, or configured to ignore specific files to make a task pass. If legitimate exclusions are needed (e.g., known flaky test), they are recorded as a separate tracked issue with a fix deadline.
3. **Evidence recorded**: The output of every gate command is recorded in `docs/PROGRESS.md` under the relevant task's command evidence section.
4. **Offline by default**: Automated tests must run without internet access. Tests requiring network calls use committed fixtures only. Live API validation is a separately labelled step marked in the task file.
5. **Deterministic output**: Tests must produce identical results on repeated runs. Non-deterministic elements (timestamps, randomness) must be mocked or seeded.

## Markdown Link Verification

For all documentation-only tasks, relative Markdown links must resolve.
Run the following from the repository root:

```bash
python3 -c "
import os, re, sys
broken = []
for root, dirs, files in os.walk('.'):
    if '.git' in root: continue
    for f in files:
        if not f.endswith('.md'): continue
        fp = os.path.join(root, f)
        with open(fp) as fh:
            for ln, line in enumerate(fh, 1):
                for m in re.finditer(r'\]\(([^)]+)\)', line):
                    link = m.group(1)
                    if link.startswith('http://') or link.startswith('https://'): continue
                    path = link.split('#')[0]
                    if not path: continue
                    target = os.path.normpath(os.path.join(root, path))
                    if not os.path.exists(target):
                        broken.append(f'{fp}:{ln} -> {link}')
sys.exit(1) if broken else None
for b in broken: print('BROKEN:', b)
"
```

This checks every `.md` file for relative links that do not resolve to an existing path.
Links beginning with `http://`, `https://`, or containing only a fragment (`#`) are skipped.

## Escalation

If a quality gate consistently fails and the root cause is unclear:

1. Record the failure in `docs/PROGRESS.md` under Known Risks.
2. Do not mark the task complete.
3. Raise the issue for human review before proceeding to the next task.
