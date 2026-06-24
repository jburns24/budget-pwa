---
name: commit
description: >-
  Create a git commit, but first check whether the changes introduced durable
  knowledge that belongs in a CLAUDE.md steering doc. Use this skill whenever the
  user asks to commit changes — "commit this", "commit my changes", "make a
  commit", "let's commit", "can you commit" — or asks you to wrap up and save
  work to git. Always use it for committing even when the user doesn't mention
  CLAUDE.md, because catching steering-doc-worthy changes at commit time is the
  whole point. The skill inspects the diff, asks whether anything should be
  recorded in a root or subdirectory CLAUDE.md, proposes those edits for your
  approval, applies the approved ones, then stages and commits everything
  together.
---

# Commit

Committing is the natural checkpoint to ask a question that's easy to forget in
the moment: **did this work teach us something a future Claude session would
need to know, and is it written down anywhere?** Code captures *what* the repo
does; a CLAUDE.md captures *how to work in it* — the commands, conventions, and
gotchas you'd otherwise have to re-explain every session. This skill folds that
check into the commit flow so durable knowledge gets recorded while it's fresh,
in the same commit as the change that introduced it.

## Workflow

Work through these steps in order. Steps 2–4 are the reason this skill exists —
don't skip them even when the change feels routine.

### 1. Inspect the changes

Look at what's actually being committed before doing anything else:

```bash
git status
git diff HEAD        # staged + unstaged; use git diff --staged if the user only wants staged
```

Read the diff, not just the file names. You need to understand *what changed and
why* to judge whether any of it is steering-doc-worthy. If the user said to
commit only what's already staged, respect that and scope your inspection to
`git diff --staged`.

### 2. Ask the significance question

For the changes in this commit, ask yourself: **did we introduce something a new
engineer (or a fresh Claude session) would need to be told, and would have to be
told more than once?** That's the bar. You're not summarizing the diff — you're
looking for *durable, reusable knowledge about how to work in this repo* that the
change either created or revealed.

Things that usually clear the bar:

- A new command someone needs to run — build, test, lint, deploy, codegen, a
  migration step, a seeding script.
- A new convention or pattern the codebase now enforces — naming, file layout, a
  preferred library chosen over an obvious alternative, an error-handling style.
- An architectural shift — a new service, module boundary, data flow, or
  integration that changes the mental model of the repo.
- A setup quirk or gotcha you hit — an env var that must be set, a dependency
  with a version pin that matters, an ordering requirement, a platform-specific
  workaround.
- A new directory or subsystem that needs a one-line "what this is / how it's
  wired" explanation.
- A repo workflow — how PRs are structured, how generated code is handled, files
  or directories that should never be touched by hand.

Things that usually **don't** clear the bar (resist the urge to document these —
a bloated CLAUDE.md is worse than a lean one because the important lines get
lost):

- Routine bug fixes, refactors, or content edits that don't change how anyone
  works in the repo.
- One-off changes with no reusable lesson.
- Anything already adequately covered by an existing CLAUDE.md — check before
  proposing. Read the relevant CLAUDE.md files first so you don't duplicate or
  contradict them.
- Restating what the code plainly says. CLAUDE.md is for what you'd *tell*
  someone, not a mirror of the source.

If nothing clears the bar, say so briefly ("No steering-doc changes needed —
this is a routine fix") and go straight to committing (step 5).

### 3. Decide the scope — root vs. a subdirectory CLAUDE.md

If something does clear the bar, place it at the **narrowest scope that fully
contains it.** Claude Code loads the nearest CLAUDE.md for the files being worked
on, so scoping keeps each doc relevant and short.

- Knowledge that only matters when working inside a specific package, app, or
  directory (e.g. a build command for `frontend/`, a convention local to
  `services/api/`) belongs in a `CLAUDE.md` **in that directory**. Create one if
  it doesn't exist yet.
- Knowledge that's true project-wide — top-level architecture, the primary
  build/test/lint commands, repo-wide conventions — belongs in the **root**
  CLAUDE.md.

Ask "where will the engineer be standing when they need to know this?" If the
answer is "only when they're in `packages/cli/`," that's where the note goes.
When a change touches several areas and the lesson is genuinely cross-cutting,
root is right; when in doubt between root and one subdir, prefer the subdir and
keep root lean.

### 4. Propose the steering-doc edits and get approval

Before editing anything, show the user your proposal:

- Which file(s) you'd edit or create, and why that scope.
- The exact text you'd add, in context (which section it goes in).

Write the addition **terse but accurate** — this is the standard for every edit
to a CLAUDE.md. Every line has to earn its place, because the file is read in
full each session and padding pushes the load-bearing lines out of view. State
the fact in the fewest words that still carry it completely: no hedging, no
preamble, no restating what a nearby line already says, but never drop a detail
that changes what the reader would do. Match the imperative/factual voice and
formatting of the existing doc. Prefer a sharp sentence over a paragraph, and a
paragraph over a new section. Then **wait for the user's go-ahead.** They may approve, tweak the wording, change the scope,
or decline. Apply only what they approve. If they decline all of it, proceed to
the commit with just the code changes.

### 5. Stage and commit

Once any approved steering-doc edits are written:

```bash
git status                          # confirm what's now changed, including the CLAUDE.md edits
git add <relevant paths>            # or git add -A if the user wants everything
git commit -m "<message>"
```

Stage the CLAUDE.md changes **in the same commit** as the code that prompted them
— they belong together. Write a commit message that matches the repo's existing
convention: inspect recent history (`git log --oneline -15`) and follow whatever
pattern you see (Conventional Commits like `feat:`/`fix:`, a ticket prefix, plain
imperative subject lines, etc.). Keep the subject focused on the change; if the
commit includes steering-doc updates, a short body line noting that is helpful
but not required.

Don't push unless the user asks. If you're on the default branch and the repo's
workflow favors feature branches, mention it rather than committing silently to
main.

## Notes

- This is the persistent-context guidance behind the significance check, in one
  line: **if you'd have to tell a new engineer something twice, it belongs in
  CLAUDE.md.** A CLAUDE.md should cover the project's purpose and architecture at
  a high level, the commands Claude needs to run, the conventions the codebase
  enforces, and the things that are easy to get wrong (setup quirks, untouchable
  files, repo-specific workflows). Think onboarding docs written for an agent.
- The steering-doc check is a *gate before* the commit, not an afterthought — run
  it every time, but keep it fast and quiet when there's nothing to record.
