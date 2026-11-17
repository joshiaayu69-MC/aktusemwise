# Style guide

The audience is an Indian engineering student revising between classes, often on a phone.
Write to be understood on the first read, then to be trusted.

## Voice

- Direct, calm, and specific. Prefer short sentences.
- Explain the idea first, then the formal definition, then a worked example.
- Use Indian English spelling: organise, behaviour, licence (noun), practice (verb).
- Use "you" for the student. Use "we" only for editorial decisions.
- Do not hype. No "guaranteed", "best", "top", "must-read", "secret", or "hack".
- Do not insult other sources or coaching institutes.

## Page shape

Every resource follows this order:

1. **What this covers** - two or three sentences.
2. **Learning outcomes** - what the student can do after reading.
3. **Main sections** - one section per syllabus unit or topic.
4. **Worked examples** - at least one per major concept.
5. **Exam focus** - mark distribution, common traps, answer structure.
6. **Recap** - five to eight bullets.
7. **Sources and licence** - official link, licence, reviewer, last verified date.

## Headings

- One `#` title only in the subject page. Inside a resource, start at `##`.
- Use sentence case: `## Normalisation and functional dependencies`.
- Do not number headings manually; the syllabus units already carry numbers.
- Keep headings under 70 characters.

## Paragraphs and lists

- One idea per paragraph. Aim for 2-5 sentences.
- Use lists for steps, conditions, and comparisons, not for prose.
- Do not nest more than two list levels.
- Do not use bold for whole paragraphs. Use it for a term on first use.

## Definitions

Use this pattern:

> **Functional dependency.** A functional dependency `X -> Y` holds when each value of `X`
> determines exactly one value of `Y`.

Then add an example. Do not stack five definitions without examples.

## Math

- Use KaTeX inline math: `$O(n \log n)$`.
- Use display math for derivations: `$$ ... $$`.
- Define every symbol the first time it appears.
- Prefer standard notation from the official syllabus. If you change notation, say so.
- Do not put important text inside math; screen readers handle it poorly.

## Code and SQL

- Use fenced blocks with a language: ` ```sql `, ` ```python `, ` ```text `.
- Keep lines under 80 characters where possible.
- Show the expected output in a separate block or a table.
- Do not use screenshots of code.

## Tables

- Use tables for comparisons and mark distributions, not for long explanations.
- Every table needs a header row.
- Keep cells short. Put a note below the table if a cell needs context.

## Diagrams

- Prefer original SVG or CSS diagrams. No copied publisher figures.
- Every diagram needs a text alternative that states the relationship, not just the labels.
- Label axes and units.
- If a diagram is decorative, mark it as such and hide it from assistive tech.

## Examples

- Use realistic Indian context: a college database, a semester result table, a bus timetable.
- Keep names generic and non-identifying.
- Show the steps, not just the answer.
- For numerical answers, include units and a sanity check.

## Exam focus

- State the marks pattern only if it is verified from an official source.
- Separate "frequently asked" from "sometimes asked"; do not invent frequencies.
- Give answer skeletons for 2-, 5-, and 10-mark questions.
- Warn about common mistakes: missing constraints, wrong normalization form, unclosed
  transactions, confusing `WHERE` and `HAVING`.

## Citations and links

- Link the official source once in the source box and once inline where a fact is easy to
  misread.
- Use descriptive link text: "official AKTU syllabus (PDF)", not "click here".
- Do not link to pirated PDFs, Telegram channels, or file-sharing mirrors.
- For open-licensed material, include title, author, source URL, licence name, and licence URL.

## Originality

- Do not copy a sentence and change a few words.
- Do not follow the source's paragraph order. Reorganise around the student's problem.
- Write your own examples, diagrams, tables, and questions.
- If a phrase is unavoidable, quote it in quotation marks with attribution and keep it short.
- A similarity score above 0.15 needs a rewrite and a note in the review file.

## AI-assisted drafts

- The author must read and edit every paragraph. Do not publish raw model output.
- Remove filler, repeated definitions, invented citations, and fake exam patterns.
- Check every number, formula, date, and subject code against the fact sheet.
- Record `ai_assisted: true` and the model name in the review and provenance files.
- A human reviewer is still required.

## Accessibility

- Use real headings in order. Do not skip from `##` to `####`.
- Add alt text for informative images; use empty alt for decoration.
- Do not rely on colour alone to explain a concept.
- Expand acronyms on first use: DBMS (database management system).
- Keep link text meaningful out of context.
- Use tables sparingly; they are hard to navigate on a phone.

## Word counts

| Resource | Target |
|---|---|
| Unit notes | 900-1,800 words per unit |
| Full subject notes | 5,000-12,000 words |
| Solved paper | 2,500-5,000 words |
| Question bank | 40-120 questions with answer outlines |
| Exam guide | 800-1,500 words |

Thin pages are worse than missing pages. If a unit has fewer than 600 useful words, merge it
with a related unit or wait until there is enough material.

## Forbidden

- Copied scans, screenshots of textbooks, or watermarked publisher PDFs.
- Fake "verified" badges, fake dates, fake paper years, or invented question papers.
- "Download" buttons that open ads, countdowns, or login walls.
- Student names, roll numbers, phone numbers, or result screenshots.
- Promises of marks, ranks, selection, or admission.
- Medical, legal, or financial advice outside the syllabus.
