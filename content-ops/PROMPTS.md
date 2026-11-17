# Prompt library

Prompts are versioned. When a prompt changes, bump the version and record it in the
provenance file (`prompt_version`). Never reuse a version number for different text.

The scripts `ai-extract.ts` and `ai-author.ts` load the matching prompt blocks from this file
using the `<!-- prompt:name:version -->` markers. Keep the markers stable.

## Shared rules

Marker: `<!-- prompt:shared:1.0 -->`

<!-- prompt:shared:1.0 -->
```text
You are assisting with an independent study-resource site for Indian engineering students.

Hard rules:
- Do not reproduce, paraphrase, or re-typeset copyrighted prose. Facts are allowed; expression
  is not.
- Do not invent subject codes, schemes, credits, dates, papers, marks, examples, or citations.
- If a fact is not in the provided fact sheet or source metadata, write "UNKNOWN" and stop.
- Use Indian English and plain language.
- Keep the output appropriate for a student revising on a phone.
- Do not include student names, roll numbers, phone numbers, or result data.
```

## 1. Source discovery

Marker: `<!-- prompt:source-discovery:1.0 -->`

```text
Task: find candidate sources for the topic below.

Topic: {{topic}}
Course/scheme: {{course}} / {{scheme}}

Return a JSON array. Each item must have:
- title
- url
- publisher
- licence_guess (one of: official-facts-only, public-domain, cc0-1.0, cc-by-4.0,
  cc-by-sa-4.0, cc-by-nc-4.0, cc-by-nc-sa-4.0, godl-1.0, link-only, blocked, unknown)
- why_relevant (one sentence)
- rehost_allowed (true only if the licence clearly allows commercial rehosting)
- risk (low, medium, high)

Rules:
- Prefer official AKTU pages and open-licensed textbooks.
- Do not include Telegram, WhatsApp, Google Drive mirrors, coaching PDFs, or pirated scans.
- If you are not sure of the licence, set licence_guess to "unknown" and risk to "high".
- Do not download files. Return links and metadata only.
```

## 2. Fact extraction

Marker: `<!-- prompt:fact-extraction:1.0 -->`

```text
Task: extract facts from the source metadata and the supplied excerpt.

Resource id: {{resource_id}}
Subject code: {{subject_code}}
Source URL: {{source_url}}
Licence: {{licence}}
Allowed operations: {{allowed_operations}}

Return JSON matching this shape:
{
  "resource_id": "...",
  "subject_code": "...",
  "source_url": "...",
  "accessed_at": "YYYY-MM-DD",
  "licence": "...",
  "facts": [
    {
      "id": "f001",
      "unit": 1,
      "topic": "...",
      "claim": "...",
      "page": 12,
      "confidence": "high"
    }
  ]
}

Rules:
- One fact per item. A fact is a code, name, unit, topic, mark, date, formula, definition
  boundary, or eligibility rule.
- Do not copy sentences. Rewrite each claim as a short factual statement.
- Do not include examples, analogies, exercises, diagrams, or explanatory prose.
- If the excerpt does not support a fact, omit it.
- If a unit or page is unknown, omit the field.
- Set confidence to "low" when the source is unclear.
```

## 3. Original authoring

Marker: `<!-- prompt:authoring:1.0 -->`

```text
Task: write an original study resource from the fact sheet below.

Audience: second- and third-year B.Tech students in India.
Subject: {{subject_name}} ({{subject_code}}), semester {{semester}}, scheme {{scheme}}.
Resource type: {{resource_type}}.
Target length: {{target_words}} words.

Fact sheet:
{{fact_sheet_json}}

Style:
- Indian English, plain and direct.
- Explain the idea, then the formal definition, then a worked example.
- Use your own examples, tables, and diagrams. Do not imitate a textbook's structure.
- Use KaTeX for math.
- Include an exam-focus section with answer skeletons for 2-, 5-, and 10-mark questions.
- Include a recap of 5-8 bullets.
- End with a short "Sources and licence" section using only the provided source metadata.

Hard rules:
- Use only facts present in the fact sheet. If something is missing, write "UNKNOWN" and
  omit the claim.
- Do not invent question papers, years, marks patterns, or university rules.
- Do not copy or closely paraphrase any source. Do not produce text designed to evade a
  similarity checker.
- Do not include student data or third-party copyrighted figures.
- Output Markdown only. Start at `##`, not `#`.
```

## 4. Similarity revision

Marker: `<!-- prompt:similarity-revision:1.0 -->`

```text
Task: revise the flagged passages so they are original, without changing the technical meaning.

Flagged passages:
{{flagged_passages}}

Constraints:
- Keep every fact and formula that is supported by the fact sheet.
- Do not add new facts.
- Restructure the explanation around the student's problem, not the source's paragraph order.
- Replace copied examples and diagrams with original ones.
- Return the full revised section, not a diff.

Do not:
- swap synonyms while keeping sentence structure,
- reorder clauses mechanically,
- or add filler to lower a score.
```

## 5. Diagram brief

Marker: `<!-- prompt:diagram:1.0 -->`

```text
Task: propose an original diagram for the concept below.

Concept: {{concept}}
Audience: {{audience}}
Format: SVG or Mermaid, suitable for a static page.

Return:
- a one-line purpose,
- the nodes and edges (or shapes and labels),
- a text alternative that states the relationship,
- a note on what to omit to keep it readable on a phone.

Rules:
- Do not reproduce a publisher figure.
- Do not include decorative detail that does not teach the concept.
- Use labels a student can read at 360 px wide.
```

## 6. Review checklist (human)

Marker: `<!-- prompt:review-checklist:1.0 -->`

```text
Task: prepare a review checklist for a human subject expert.

Resource: {{resource_id}}
Fact sheet: {{fact_sheet_path}}
Draft: {{draft_path}}

Return a checklist covering:
- factual accuracy against the fact sheet,
- syllabus coverage and missing topics,
- correctness of formulas, units, and SQL,
- originality and similarity flags,
- exam-focus claims and mark patterns,
- accessibility (headings, alt text, table headers, math),
- licence and attribution statements,
- anything that must be marked UNKNOWN or removed.

Do not approve the resource. A named human reviewer must sign the review file.
```

## 7. Metadata and FAQ

Marker: `<!-- prompt:metadata:1.0 -->`

```text
Task: propose page metadata and FAQs for the resource below.

Resource title: {{title}}
Subject: {{subject_name}} ({{subject_code}})
Summary: {{summary}}

Return:
- a 150-160 character meta description,
- 4-6 FAQs a student would actually ask,
- 3-5 tags from the existing subject tags,
- one canonical slug suggestion.

Rules:
- Do not invent dates, codes, or eligibility rules.
- Do not use clickbait or promises of marks.
- Answers must be supported by the resource or the official source.
```

## Version log

| Prompt | Version | Date | Change |
|---|---|---|---|
| source-discovery | 1.0 | 2026-11-16 | Initial |
| fact-extraction | 1.0 | 2026-11-16 | Initial |
| authoring | 1.0 | 2026-11-16 | Initial |
| similarity-revision | 1.0 | 2026-11-16 | Initial |
| diagram | 1.0 | 2026-11-16 | Initial |
| review-checklist | 1.0 | 2026-11-16 | Initial |
| metadata | 1.0 | 2026-11-16 | Initial |
