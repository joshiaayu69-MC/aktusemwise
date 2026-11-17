# note.md — Legal Resource Sourcing & AI Content Production Playbook

> **Read this before creating, drafting, importing, or uploading any resource.**
> `description.md` is the source of truth for the project. This file explains **how to
> obtain or create resources legally** and **how AI agents must do the work**.
> If this file conflicts with `description.md`, follow `description.md` and ask the user.
>
> **This is an operational policy, not legal advice.** Before commercial launch (AdSense,
> sponsorships, premium), have an Indian intellectual-property lawyer review the model,
> the PYQ policy, and the official-document policy.

**Why this file exists.** The site cannot launch on a library of re-uploaded PDFs. That is
the fastest route to takedowns, AdSense rejection, and legal risk. This playbook replaces
"find a PDF and upload it" with a repeatable process: **discover -> classify licence ->
extract facts -> write original content -> verify -> human review -> publish with
provenance.** The result is a real, downloadable library that we can defend and monetise.

---

## 0. The one-paragraph answer

We will not solve the resource problem by copying, OCR-laundering, or re-typesetting
copyrighted PDFs. We will solve it by building a **clean-room content factory**:

1. Use AI to **discover and classify** sources and their licences.
2. Use AI to **extract only facts** (subject codes, units, topics, marks, dates, formulas)
   from official or licensed sources.
3. Use a **separate AI authoring step** that sees only the verified fact sheet — never the
   copyrighted prose — to write genuinely original notes, solutions, question banks,
   model papers, guides, and quizzes.
4. Verify with **similarity checks + subject-expert human review + fact checks**.
5. Generate our own **text-based, accessible PDFs** with our branding/watermark, and
   publish only when a provenance record and licence record exist.

Original content is the moat. AI is the factory, not a laundering machine.

---

## 1. The hard truths (read twice)

### 1.1 A watermark does not create rights

Putting "YourBrand" on a re-typeset scan of someone else's book does **not** make the
content ours. If the result is substantially similar to the original, it is a
**derivative work** and can still infringe copyright. A watermark is branding and
provenance, not a legal shield.

### 1.2 "Similar but not copied" is not a safe rule by itself

Courts look at **substantial similarity of expression**, not just identical words.
Copying the same structure, sequence, examples, diagrams, worked problems, and
explanations with synonyms swapped can still infringe. Safe originality requires:

- independent facts,
- independent structure,
- independent examples and diagrams,
- independent wording,
- evidence of the process (fact sheet, prompts, similarity report, reviewer sign-off).

### 1.3 Scanned PDFs are the highest-risk input

A scan is a reproduction of the entire protected work: text, layout, figures, and
selection/arrangement. OCR + paraphrase is still risky if the output tracks the source.
**Never feed a competitor/publisher/Telegram scan into the authoring model.**

### 1.4 Facts are not copyrightable; expression is

Subject codes, unit names, topic lists, credits, marks, exam duration, dates, formulas,
and widely accepted standard definitions (restated in our own words, with a source) are
facts/ideas. We can restate them in our own structured data with attribution. The
source's **sentences, layout, diagrams, question-paper compilation, and creative
examples** are protected.

### 1.5 Official does not automatically mean public domain

In India there is no broad "government edicts are public domain" rule like the US.
Treat AKTU PDFs, notices, syllabi, and question papers as **copyrighted unless a
specific licence or written permission says otherwise**. We may:

- link to the official file,
- extract facts and restate them,
- quote a short, necessary excerpt with attribution (keep it minimal),
- publish our own original analysis, solutions, and guides.

We may **not** re-host the official PDF without written permission.

### 1.6 AI output has weak copyright protection on its own

Copyright generally requires human authorship. Purely AI-generated text may not be
protected in India or the US. Human selection, arrangement, editing, examples, diagrams,
and review can create protectable contributions. Do not overclaim "all rights reserved"
over AI-only output; do claim your original compilation/edits honestly.

### 1.7 AdSense makes the site commercial

"Non-commercial" (NC) Creative Commons content must not be hosted on an ad-supported
site. Treat NC as **link-only** once ads are enabled. CC BY-SA adaptations must stay
under BY-SA with attribution; you cannot add "all rights reserved" or extra restrictions.

### 1.8 Fair dealing is not a content strategy

India's fair-dealing exception (Copyright Act, 1957, s.52) is narrow: private study,
research, criticism/review, reporting current events, and limited classroom/exam uses.
It is not a blanket "education" licence and does not justify building a public,
ad-supported library out of other people's PDFs. When in doubt, link and write original
material instead of relying on fair dealing.

---

## 2. The legal source ladder

Use the highest rung that gives you the resource. Never skip a rung.

| Rung | Source type | What we may do | What we must do |
|---|---|---|---|
| A | **Our own original work** (AI-assisted + human-authored/reviewed) | Publish, adapt, watermark, monetise | Keep provenance, disclose AI assistance, human review |
| B | **CC0 / public domain** | Rehost, adapt, monetise | Verify term in India; attribute author where known; do not add restrictions |
| C | **CC BY** | Rehost, adapt, monetise | Attribute, link licence, state changes |
| D | **CC BY-SA** | Rehost, adapt, monetise | Attribute, state changes, license derivative under BY-SA |
| E | **GODL-India / government open data** | Use per dataset terms, often monetise | Attribute as required; check dataset-specific terms |
| F | **Official AKTU / university documents** | Link, extract facts, short quote, write original analysis | Attribute, do not rehost PDF, do not imply endorsement |
| G | **CC BY-NC / NC-SA** | Link only when ads are on | Do not host or adapt for monetised use |
| H | **Publisher books, coaching notes, "Quantum", competitor sites, Telegram PDFs, unknown licence** | **Link only if useful; never copy, OCR, paraphrase, or rehost** | Nothing. Do not ingest into authoring. |

### 2.1 Decision tree

```
Is it ours (created by our team/AI with human authorship)?       -> A: publish as site-original
Is it CC0 / public domain in India?                             -> B: rehost/adapt with attribution
Is it CC BY?                                                    -> C: adapt with attribution + change notice
Is it CC BY-SA?                                                 -> D: adapt, keep BY-SA, attribute
Is it GODL-India?                                               -> E: follow dataset terms
Is it official AKTU / a university document?                    -> F: facts + link + original analysis only
Is it NC-licensed and the site has ads?                         -> G: link only
Is the licence unknown, or is it a publisher/competitor scan?   -> H: do not use; link only
```

### 2.2 Do not use

- "Quantum" series, publisher textbooks, coaching material, paid question banks.
- Scans from notesgallery, aktunotes, aktuquestionpaper.com, kopykitab,
  lastmomenttuitions, Scribd, Studocu, CourseHero, Chegg, Quizlet, or similar.
- Telegram/WhatsApp/Google Drive PDFs of unknown origin.
- YouTube transcripts, paid course notes, or "leaked" papers.
- Anything marked "All rights reserved" or with no visible licence.
- AI "notes" published without human review, fact-checking, and originality checks.

---

## 3. What we will actually publish (and why it is legal)

The site needs **real downloadable resources**. These are the safe, high-value products.

| Resource | Legal basis | AI role | Human role | Risk |
|---|---|---|---|---|
| Structured syllabus pages | Facts from official syllabus; original structure/intros | Extract facts, build unit/topic tables | Verify codes, units, credits, marks against official source | Low |
| Unit-wise notes PDFs | Original writing from verified facts | Draft explanations, examples, diagrams, exam tips | Subject expert rewrites/approves; similarity check | Low |
| Formula sheets | Facts/formulas; original compilation | Extract and verify formulas; original layout | Verify every formula and unit | Low |
| PYQ pages | Link to official paper; transcribe/paraphrase only what is needed | Extract year/pattern/topic tags; draft original solutions | Verify paper/year; legal review of question reproduction | Medium |
| Solved papers | Original solutions to questions | Draft step-by-step solutions | Expert verifies correctness; check question reproduction | Medium |
| Model papers | Original questions mapped to syllabus | Generate blueprint + questions + marking scheme | Expert reviews difficulty, marks, coverage | Low |
| Question banks | Original questions by unit/marks | Generate + answer outlines | Expert verifies accuracy and coverage | Low |
| Lab files / manuals | Original writing; code must be original or permissively licensed | Draft aim/theory/algorithm/code/viva | Lab instructor verifies; code licence check | Low |
| Viva sets | Original Q&A from syllabus | Generate short answers, common mistakes | Expert verifies | Low |
| Exam updates blog | Facts from official notices + original commentary | Summarise facts, build checklist, link official | Verify date, circular number, affected students | Low |
| Result / OneView guide | Facts + original instructions; link to official portal | Draft steps, common errors, FAQs | Verify portal URL and process; no scraping | Low |
| Scholarship guide | Facts from official scheme pages + original checklist | Summarise eligibility/documents/deadlines | Verify with official source; mark "verify before applying" | Low |
| Quiz / MCQ bank | Original questions from our notes/facts | Generate MCQs + explanations | Expert verifies correctness; no copied question banks | Low |
| CGPA calculator / tools | Original code; official formula if verified | Generate code/tests/docs | Verify formula and edge cases | Low |

**Key:** every product above can be genuinely useful without copying a single protected
PDF. The "download" is our own PDF, not a mirror.

---

## 4. The clean-room AI pipeline (mandatory)

No agent may skip a gate. Each gate writes a file that the next gate consumes.

```
GATE 0  Discover      -> candidate source + URL + robots/licence/access notes
GATE 1  Classify      -> licence decision + allowed operations + risk level
GATE 2  Extract       -> facts.json ONLY (no sentences, no prose, no copied structure)
GATE 3  Author        -> original draft (fact sheet is the only source input)
GATE 4  Verify        -> similarity + fact check + citation check + AI review
GATE 5  Human review  -> subject expert signs off; corrections applied
GATE 6  Build PDF     -> own typesetting, own diagrams, watermark, accessibility
GATE 7  Publish       -> provenance ledger + R2 upload + page metadata + takedown log
```

### Gate 0 — Discover

**Agent:** Scout.

- Start from official sources: `aktu.ac.in` syllabus, notices, question-paper portal.
- Search open resources: OpenStax, LibreTexts, Open Textbook Library, OER Commons,
  Wikibooks, Wikimedia Commons, Project Gutenberg, data.gov.in, DOAJ, OpenAlex.
- Record: URL, title, author/publisher, access date, licence text/link, robots.txt status,
  whether login/paywall is required, and intended use.
- Respect `robots.txt`, rate limits, and terms. No login/paywall/CAPTCHA bypass. No bulk
  crawling. One request per second maximum; cache locally.
- Do not download files you are not licensed to keep. For facts-only sources, extract
  then delete the raw file.

Useful discovery queries (examples, adapt to the subject):

```text
site:aktu.ac.in filetype:pdf "B.Tech" "semester 3" syllabus
site:aktu.ac.in "old question paper" <subject-code>
site:openstax.org <topic>
site:libretexts.org <topic>
site:open.umn.edu <topic>
site:oercommons.org <topic>
site:wikibooks.org <topic>
site:commons.wikimedia.org <concept> diagram
site:gutenberg.org <classic topic>
site:data.gov.in <education dataset>
site:doaj.org <topic>
site:openalex.org <topic>
```

Archive important official pages with the Wayback Machine so citations remain stable
even if the university changes its site. Respect `robots.txt` and never bulk crawl.

**Output:** `content-ops/sources/<source-id>.json`

### Gate 1 — Classify

**Agent:** Auditor.

- Read the licence, not the vibe. "Free to read" ≠ "free to re-upload".
- Assign one of: `site-original`, `cc0`, `public-domain`, `cc-by-4.0`,
  `cc-by-sa-4.0`, `godl-1.0`, `official-facts-only`, `link-only`, `permission-granted`,
  `blocked`.
- Record allowed operations: `facts-only`, `link-only`, `quote-limited`,
  `adapt-cc-by`, `adapt-cc-by-sa`, `rehost-cc-by`, `rehost-cc-by-sa`,
  `rehost-cc0-pd`, `rehost-permission`.
- If the site has ads, mark all NC licences `link-only`.
- If the source is a competitor/publisher/Telegram scan, mark `blocked` and stop.
- When unsure, choose the stricter option and ask the user.

**Output:** updated `source.json` with `licence`, `allowed_operations`, `risk`,
`commercial_use_ok`, `share_alike`, `attribution_required`.

### Gate 2 — Extract (facts only)

**Agent:** Extractor.

This is the most important technical safeguard. The extraction model may read the
licensed/official source, but its output must contain **only atomic facts**:

- subject code, name, course, branch, semester, scheme, credits,
- unit numbers, unit titles, topic/subtopic names,
- marks distribution, exam duration, internal/external split,
- standard formulas and constants,
- dates, circular numbers, deadlines, eligibility criteria,
- page reference and source URL for each fact.

**Forbidden in `facts.json`:**

- sentences copied from the source,
- paragraph summaries,
- the source's unique examples, analogies, or diagram descriptions,
- the source's structure beyond the official syllabus order,
- anything that would let the author reconstruct the original prose.

**Output:** `content-ops/facts/<resource-id>.json`

Example:

```json
{
  "subject_code": "BCS501",
  "resource_id": "bcs501-notes-unit-1",
  "source_url": "https://aktu.ac.in/syllabus.html",
  "accessed_at": "2026-11-16",
  "licence": "official-facts-only",
  "facts": [
    {
      "id": "F001",
      "unit": 1,
      "topic": "DBMS architecture",
      "claim": "A DBMS separates physical data storage from logical application views.",
      "page": 2,
      "confidence": "high"
    }
  ]
}
```

### Gate 3 — Author (original writing)

**Agent:** Author.

- Input: `facts.json`, official syllabus structure, style guide, audience profile.
- **Do not input:** the copyrighted PDF, competitor notes, publisher text, Telegram scans.
- Write original explanations, original examples, original diagrams, original exam tips.
- Use standard facts; cite non-obvious claims. Keep quotes under 25 words and attributed.
- For PYQ: prefer paraphrasing the question or linking the official paper; write fully
  original solutions. Do not reproduce the paper's layout.
- For diagrams: generate new Mermaid/TikZ/SVG from a concept list. Do not trace or copy
  a source figure. Verify labels and accuracy.
- Mark uncertain claims with `TODO:`; do not invent data.
- Follow the site style: short paragraphs, unit-wise headings, worked examples,
  "exam focus" boxes, common mistakes, 2/5/10-mark question outlines.

**Output:** `content-ops/drafts/<resource-id>.mdx`

### Gate 4 — Verify

**Agent:** Verifier (a separate model/session from the author).

Run all checks and write `content-ops/reviews/<resource-id>.json`:

1. **Similarity vs source:** compare against any reference text we are allowed to keep.
   Flag any identical sequence of 8+ words; target zero. Flag close paraphrase and
   copied structure.
2. **Web similarity:** search exact phrases from the draft; flag matches on commercial
   notes sites, publisher sites, or competitor sites.
3. **Fact check:** every code, unit, mark, formula, date, and deadline has a source or
   is standard knowledge. Numeric claims are recomputed or verified.
4. **Citation check:** every non-obvious claim has a source; official links resolve.
5. **Coverage check:** draft covers the syllabus unit and the promised marks pattern.
6. **Readability/quality:** no filler, no hallucinations, no repeated boilerplate,
   no fake "verified" badges.
7. **AI review:** ask a reviewer model to identify copied phrasing, unsupported claims,
   and generic/low-value sections. Provide line numbers and fixes.

**Thresholds (starting policy):**

- 8-gram overlap with any protected source: **0**.
- 20+ word identical sequence: **0** unless a short attributed quote.
- Web phrase matches on prohibited sites: **0**.
- Factual errors: **0**.
- Human reviewer required for every published resource.

**Output:** `reviews/<resource-id>.json` with `similarity_score`, `flags`, `fixes`,
`fact_check`, `verdict`.

### Gate 5 — Human review

**Reviewer:** named subject expert (teacher, senior student, or contributor with verified
knowledge).

Checklist:

- [ ] Syllabus mapping is correct for the scheme/semester.
- [ ] Definitions, formulas, and worked examples are correct.
- [ ] No copied text, figure, table, or question bank.
- [ ] Difficulty and marks pattern are realistic.
- [ ] Language is clear for Indian B.Tech students.
- [ ] Sources and licence are recorded.
- [ ] AI assistance is disclosed on the page.
- [ ] `verified: true` is set only after this sign-off.

Record: reviewer name/initials, date, resource version, changes made.

### Gate 6 — Build PDF

**Agent:** Publisher.

- Author in Markdown/MDX, then typeset with **Typst**, **LaTeX**, or **Pandoc**.
- Output must be **text-based and selectable**, not a scan. This improves accessibility,
  search, and trust.
- Add:
  - cover with title, subject code, semester, scheme, "Original study material",
  - footer: brand, page number, licence, "Not affiliated with AKTU",
  - sources/licence page,
  - reviewer + last-updated line,
  - short AI-assistance disclosure.
- Diagrams: original Mermaid/TikZ/SVG. No copied figures. Check visual similarity.
- Watermark policy:
  - `site-original`: visible brand watermark + PDF metadata is fine.
  - `cc-by` / `cc-by-sa` / `cc0` / `public-domain`: attribution is required; do not imply
    exclusive ownership; for BY-SA, keep the derivative under BY-SA; do not add
    DRM/extra restrictions.
  - Never watermark a blocked/unknown-licence source.
- Accessibility: headings, bookmarks, alt text for figures, readable contrast, tagged
  output where possible.
- Size: target < 8 MB; hard limit < 25 MiB. Linearize with `qpdf --linearize`.
- File naming per `description.md` §8.3.
- Store the PDF outside Git (R2 only). Never commit PDFs.

### Gate 7 — Publish

- Upload to R2 under the canonical key.
- Add/update the subject YAML resource entry with licence, provenance path, reviewer,
  similarity score, and file hash.
- Add the Pagefind/metadata/JSON-LD fields required by `description.md`.
- Record the provenance manifest in Git.
- Add the resource to `CREDITS.md` if third-party content is involved.
- Log the takedown contact and date.
- Run `npm run build` and the validation checks.

---

## 5. Source registry and metadata

### 5.1 `content-ops/sources.yaml`

```yaml
- id: aktu-syllabus
  title: AKTU Official Syllabus
  url: https://aktu.ac.in/syllabus.html
  publisher: Dr. A.P.J. Abdul Kalam Technical University
  accessed_at: 2026-11-16
  licence: official-facts-only
  allowed_operations: [facts-only, link-only, quote-limited]
  commercial_use_ok: true   # facts + original analysis only
  attribution_required: true
  rehost_pdf: false
  risk: medium
  notes: >
    Extract subject codes, units, topics, credits, and marks. Do not rehost the PDF
    or reproduce its layout. Write original unit introductions and preparation tips.

- id: openstax-db
  title: Database Fundamentals (example)
  url: https://openstax.org/
  licence: cc-by-4.0
  allowed_operations: [adapt-cc-by, rehost-cc-by]
  commercial_use_ok: true
  attribution_required: true
  share_alike: false
  risk: low
  notes: Verify the specific book's licence page before use.
```

### 5.2 Resource metadata in subject YAML

Add these fields to the existing schema (see `description.md` §8.2):

```yaml
resources:
  - type: notes
    title: "BCS501 DBMS — Unit 1 Notes"
    r2_key: bcs501/notes/bcs501-notes-unit-1.pdf
    pages: 24
    size_mb: 1.8
    updated: 2026-11-20
    verified: true
    licence: site-original
    source_basis:
      - url: https://aktu.ac.in/syllabus.html
        use: facts-only
    provenance: content-ops/provenance/bcs501-notes-unit-1.json
    ai_assisted: true
    reviewer: "Initials/name"
    reviewed_at: 2026-11-20
    similarity_score: 0.0
    file_hash: "sha256:..."
```

Allowed `licence` values:
`site-original | cc0-1.0 | public-domain | cc-by-4.0 | cc-by-sa-4.0 | godl-1.0 | permission-granted`

Allowed `source_basis[].use` values:
`facts-only | link-only | quote-limited | adapt-cc-by | adapt-cc-by-sa | rehost-cc-by | rehost-cc-by-sa | rehost-cc0-pd | rehost-permission`

### 5.3 Provenance manifest

`content-ops/provenance/<resource-id>.json`

```json
{
  "resource_id": "bcs501-notes-unit-1",
  "file": "bcs501/notes/bcs501-notes-unit-1.pdf",
  "sha256": "...",
  "created_at": "2026-11-20",
  "author": "AI-assisted; reviewed by <name>",
  "model": "<model-id>",
  "prompt_version": "author-v1",
  "fact_sheet": "content-ops/facts/bcs501-notes-unit-1.json",
  "sources": [
    {
      "url": "https://aktu.ac.in/syllabus.html",
      "licence": "official-facts-only",
      "use": "facts-only"
    }
  ],
  "review": {
    "reviewer": "<name>",
    "date": "2026-11-20",
    "checklist": "content-ops/reviews/bcs501-notes-unit-1.json"
  },
  "similarity": {
    "score": 0.0,
    "report": "content-ops/reviews/bcs501-notes-unit-1.json"
  },
  "licence": "site-original",
  "watermark": "YourBrand",
  "takedown_contact": "grievance@yourbrand.in"
}
```

Every published PDF must have a manifest. No manifest = no publish.

---

## 6. AI agent rules

### 6.1 Agent roles

| Agent | May read | May write | Must never do |
|---|---|---|---|
| Scout | web, official sites, OER catalogues | source records | bypass paywalls/logins, bulk scrape, download unknown PDFs |
| Auditor | source record, licence text | licence decision | guess a licence, approve a blocked source |
| Extractor | licensed/official source | `facts.json` | output prose, summaries, examples, or copied structure |
| Author | `facts.json`, syllabus, style guide | draft MDX | read the copyrighted source, paraphrase it, copy figures |
| Verifier | draft, fact sheet, allowed references | review JSON | approve high similarity or unsupported claims |
| Publisher | approved draft, provenance | PDF, R2 upload | publish without human sign-off, commit PDFs to Git |
| Compliance | provenance, complaints | takedown log | ignore a complaint |

### 6.2 Allowed AI uses

- Extract facts from official/licensed documents.
- Build syllabus tables and topic maps.
- Draft original explanations, examples, and exam tips from facts.
- Generate original diagrams from a concept list.
- Generate original MCQs and answer outlines from our notes.
- Create original model papers from a syllabus blueprint.
- Summarise official notices with a link and original checklist.
- Translate/adapt our own content.
- Run similarity/fact/quality reviews.

### 6.3 Forbidden AI uses

- "Rewrite this PDF so it is not copied."
- "Change 30% of the words and add our watermark."
- "OCR this scan and make a new PDF."
- "Summarise Quantum/publisher/competitor notes."
- "Copy the question paper and make minor edits."
- "Generate 500 subject pages with no sources or review."
- "Invent subject codes, schemes, years, papers, or verified badges."
- "Scrape OneView/result portals or store student data."
- "Use NC content on an ad-supported page."
- "Add DRM or extra restrictions to CC BY-SA material."

### 6.4 Prompt templates

**Fact extraction**

> You are a fact extractor. Read the provided licensed/official document. Output only a
> JSON array of atomic facts: subject code, title, unit, topic, subtopic, marks, credits,
> exam duration, formulas, dates, circular numbers, eligibility criteria. For each fact,
> include the page number, source URL, and confidence. Do not output sentences from the
> source. Do not summarise paragraphs. Do not include the source's examples, analogies,
> figures, or tables. If a fact is unclear, omit it and add a `TODO`.

**Original authoring**

> You are an academic author writing original study notes for Indian B.Tech students.
> Input: a verified fact sheet and the official syllabus structure. You have not seen the
> source document and must not attempt to reproduce it. Write in your own words, with
> original explanations, original examples, and original diagrams. Do not reproduce any
> sequence of 8 or more words from any known source. Mark non-obvious claims with a
> citation. Add exam-focus notes, common mistakes, and 2/5/10-mark question outlines.
> Do not invent codes, marks, dates, or facts. Output MDX only.

**PYQ policy**

> You are writing original solutions and exam analysis, not rehosting a paper. Use only
> the verified fact sheet: year, subject code, question stems that are necessary and
> factual, marks, and topic tags. Write fully original step-by-step solutions and
> analysis. Do not reproduce the paper's layout, instructions, or long creative question
> text. If reproduction is uncertain, paraphrase the question and link the official paper.

**Diagram generation**

> Create an original Mermaid/TikZ/SVG diagram from this concept list. Use your own
> layout, labels, and examples. Do not copy or trace any existing figure. Output code
> only, then describe what the reviewer should verify.

**Reviewer**

> Compare the draft with the allowed source excerpts. Report: (1) any identical sequence
> of 8+ words, (2) close paraphrase, (3) copied structure or examples, (4) unsupported
> factual claims, (5) generic/low-value sections. Return line numbers and concrete fixes.
> A resource with high similarity must not be approved.

**Updates/guide**

> Write an original explainer from these verified facts: date, circular number, what
> changed, who is affected, action required, official URL. Add original context, a
> checklist, and common mistakes. Do not copy the notice text beyond a short attributed
> quote. Do not invent deadlines or eligibility.

---

## 7. Originality verification

### 7.1 Checks

| Check | Method | Pass condition |
|---|---|---|
| Exact overlap | 8-gram comparison against allowed references | 0 identical sequences |
| Long overlap | 20+ word sequence search | 0 (except short attributed quote) |
| Web overlap | exact-phrase search on prohibited sites | 0 |
| Semantic similarity | embedding cosine vs source chunks | below threshold; human reviews |
| Structure | compare headings/examples/sequence | independently organized |
| Figures | visual + code comparison | original, not traced |
| Facts | source-by-source verification | 100% sourced or standard |
| Citations | link check + archive | all resolve or archived |

### 7.2 When similarity is high

1. Do not publish.
2. Rewrite from the fact sheet with new structure and new examples.
3. Replace copied diagrams with original ones.
4. Re-run similarity.
5. If the draft still tracks the source, discard it and start from a different approach.

Never "fix" similarity by swapping synonyms. That is still a derivative work.

### 7.3 Keep evidence

Store the fact sheet, prompts, model IDs, review JSON, similarity report, reviewer
sign-off, and file hash. This is our defense if a complaint arrives.

---

## 8. PDF production standards

- **Source:** Markdown/MDX from Gate 3, never a scan.
- **Typesetting:** Typst (preferred for speed), LaTeX (math-heavy), or Pandoc.
- **Text-based:** selectable text, real headings, bookmarks, alt text.
- **Cover:** title, code, semester, scheme, "Original study material", brand.
- **Footer:** page number, licence, non-affiliation disclaimer.
- **Sources page:** every fact source, licence, access date, changes made.
- **Reviewer page:** reviewer name/initials, review date, version.
- **AI disclosure:** "AI-assisted draft; reviewed by a subject expert."
- **Watermark:** visible brand mark; do not imply ownership of third-party content.
- **Compression:** `qpdf --linearize`; target < 8 MB; hard limit < 25 MiB.
- **No PDFs in Git.** R2 only.
- **Naming:** `{code}/{type}/{code}-{type}-{unit|year}.pdf`.
- **Hash:** record SHA-256 in the provenance manifest and R2 metadata.

---

## 9. Content-by-content playbook

### 9.1 Syllabus pages

- Extract codes, names, credits, units, topics, marks from the official syllabus.
- Write original unit introductions, "what to expect", and preparation tips.
- Add "Syllabus last verified" date and official link.
- Do not reproduce the PDF layout or full descriptive prose.
- Do not invent codes or scheme mappings.

### 9.2 Notes PDFs

- One PDF per unit or a complete set, depending on demand.
- Structure: learning outcomes, concepts, definitions, worked examples, diagrams,
  exam focus, common mistakes, question outlines, summary.
- Use original examples and diagrams.
- Human expert reviews every unit.
- Never paraphrase a publisher's chapter structure; build from the syllabus.

### 9.3 PYQ pages

- Default: link to the official paper and publish original analysis + solutions.
- If transcribing question stems: keep only what is necessary, attribute the paper/year,
  and have a lawyer review the policy before scaling.
- Never rehost the scanned paper.
- Add topic tags, difficulty, marks, and "how to approach" notes.
- Do not claim the paper is "official" unless the link is official.

### 9.4 Solved papers / model papers

- Model papers: original questions mapped to the syllabus blueprint and marks pattern.
- Solved papers: original step-by-step solutions with marking scheme.
- Include a blueprint table: unit, topic, marks, Bloom's level, difficulty.
- Do not copy existing papers or coaching solutions.

### 9.5 Question banks

- Original questions grouped by unit and marks (2/5/10).
- Answer outlines, not copied answers.
- Track coverage against the syllabus.
- Expert verifies correctness and difficulty.

### 9.6 Lab files / manuals

- Original aim, theory, algorithm, code, sample output, viva.
- Code must be original or under MIT/BSD/Apache-2.0 with attribution.
- Do not copy lab manuals, screenshots, or institution-specific templates.
- Remove student names, roll numbers, and institution logos.

### 9.7 Viva sets

- Original Q&A from syllabus facts.
- Short answers, common mistakes, follow-up questions.
- Expert review for accuracy.

### 9.8 Updates blog

- Facts: date, circular number, what changed, who is affected, action required, link.
- Original commentary, checklist, timeline, and "what to do next".
- Verify against the official notice; mark "last verified".
- Quote minimally; link the official source.
- Do not invent dates, eligibility, or results.

### 9.9 Result / OneView guide

- Explain the official process step by step.
- Link the official portal.
- Cover common errors, browser issues, and what to do if the result is missing.
- Never mirror the portal, scrape results, or collect roll numbers/passwords.
- No "check result here" fake forms.

### 9.10 Scholarship guide

- Explain eligibility, documents, deadlines, and application steps from official pages.
- Link official portals.
- Add an original checklist and common mistakes.
- Add "Verify before applying; rules change" and a last-verified date.
- Do not guarantee approval or invent amounts.

### 9.11 Quiz / MCQ bank

- Generate from our own notes and verified facts.
- Four options, one correct, explanation, source fact, difficulty.
- Expert verifies correctness and ambiguity.
- Do not copy question banks or exam questions verbatim.

### 9.12 CGPA calculator and tools

- Original code and UI.
- Use the official formula only after verification; link the source.
- Add tests for edge cases and a disclaimer.
- No student data collection.

---

## 10. Open-licence and public-domain rules

### 10.1 Attribution templates

CC BY:

> Adapted from *[Title]* by [Author], [Publisher], licensed under CC BY 4.0.
> Changes: condensed, reorganised, and mapped to the AKTU syllabus.
> Licence: https://creativecommons.org/licenses/by/4.0/

CC BY-SA:

> Adapted from *[Title]* by [Author], licensed under CC BY-SA 4.0.
> Changes: condensed and mapped to the AKTU syllabus.
> This adapted material is licensed under CC BY-SA 4.0.
> Licence: https://creativecommons.org/licenses/by-sa/4.0/

CC0 / public domain:

> Based on *[Title]* by [Author], public domain / CC0. Original additions and
> arrangement by [Brand]. Verify the public-domain status in India.

GODL-India:

> Contains data from [Dataset], Government of India, licensed under GODL-India.
> Source: [URL]. Changes: reformatted for study use.

### 10.2 Rules

- Keep attribution on the page and in `CREDITS.md`.
- Link the licence.
- State changes.
- Do not add restrictions to CC0/public domain material.
- For BY-SA, license the derivative under BY-SA; do not add DRM or "all rights reserved".
- For NC, link only when ads are enabled.
- Verify public-domain status in India (generally life + 60 years; check the specific work).
- Some Project Gutenberg works are public domain in the US but still protected in India.
- Wikimedia Commons: check each file's licence and attribution requirements.
- OpenStax/LibreTexts: verify the specific book/page licence; some are NC or have
  third-party copyrighted excerpts.

---

## 11. Compliance package (required before launch)

Create and link these pages:

- **About** — who we are, editorial process, AI use, how to report errors.
- **Contact** — real email/form.
- **Privacy** — Cloudflare Web Analytics, no cookies, no student data.
- **Terms** — acceptable use, no warranty, educational purpose.
- **Disclaimer** — non-affiliation with AKTU, accuracy limits, official-source links.
- **Copyright / Takedown** — grievance officer, complaint process, timelines.
- **Editorial Policy** — sourcing, review, AI disclosure, corrections, update cadence.
- **CREDITS.md** — all CC/public-domain attributions.
- **Licence log** — every permission, date, scope, expiry.

Required disclaimer:

> YourBrand is an independent student resource. It is not affiliated with, endorsed by,
> or connected to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow. AKTU names
> and marks belong to their respective owners. Syllabus and question papers are referenced
> for educational purposes only.

### 11.1 Takedown workflow

1. Publish a named grievance officer and contact.
2. Acknowledge complaints within 24 hours.
3. Resolve within 15 days (IT Rules 2021 intermediary practice).
4. Remove content within 36 hours of a court/government order.
5. Verify the complainant's ownership; preserve the provenance record.
6. Remove or replace the resource; notify the contributor/reviewer.
7. Log the complaint, action, and date.
8. Do not restore until the claim is resolved.

### 11.2 Permission request template

> Subject: Permission request — educational resource referencing [work]
>
> Hello [Name/Office],
>
> I run [Brand], an independent study-resource site for Indian engineering students. We
> would like permission to [extract facts / quote a short excerpt / adapt specific
> chapters / host the file] from [work], with clear attribution and a link to the original.
> We will not imply endorsement. Our intended use is [educational, ad-supported]. Please
> let us know the terms, attribution format, and any restrictions.
>
> Thank you,
> [Name, role, contact, URL]

Record the response in `content-ops/permissions/`. If no response, link only.

---

## 12. AdSense readiness

AdSense is allowed only when the site is genuinely valuable and original.

### 12.1 Requirements

- 20–30 substantial, original pages before applying.
- Clear About, Contact, Privacy, Terms, Disclaimer, Copyright pages.
- Named authors/reviewers and an editorial policy.
- AI-assistance disclosure.
- Original diagrams/images or properly attributed CC assets.
- No scraped, auto-generated, or copied content.
- No misleading download buttons, interstitials, or ads disguised as content.
- No prohibited content (academic cheating, leaked papers, personal data).
- Mobile-friendly, fast, accessible.

### 12.2 Policy risks

- **Low-value content:** thin subject pages, duplicate descriptions, filler.
- **Scaled content abuse:** mass AI pages without human value.
- **Copyrighted content:** rehosted PDFs, copied notes, copied figures.
- **Misrepresentation:** fake "official", fake "verified", fake deadlines.
- **Ad placement:** ads that look like download buttons or navigation.

### 12.3 Ad placement rules

- Never place an ad where a download button is expected.
- No ads on legal, 404, or thin pages.
- No pop-ups, interstitials, or countdowns.
- Keep the download link visually distinct and above the fold.
- Do not click your own ads or ask others to.

---

## 13. Implementation plan in this repo

### 13.1 Create these folders (when implementation starts)

```
content-ops/
├─ sources.yaml                 # source registry + licences
├─ sources/                     # per-source JSON records
├─ facts/                       # fact sheets (no prose)
├─ drafts/                      # original MDX drafts
├─ reviews/                     # similarity/fact/quality reports
├─ provenance/                  # per-resource manifests
├─ permissions/                 # written permissions + scope
├─ archive/                     # archived official pages/links (facts only)
└─ styleguide.md                # voice, structure, examples, formatting
```

### 13.2 Scripts to add (Phase 6)

| Script | Purpose |
|---|---|
| `scripts/source-audit.ts` | Validate `sources.yaml`: URL, licence, access date, allowed ops |
| `scripts/license-gate.ts` | Block publish if licence is incompatible with ads/rehosting |
| `scripts/extract-facts.ts` | Run the extraction prompt; enforce JSON-only output |
| `scripts/draft-resource.ts` | Run the authoring prompt from a fact sheet |
| `scripts/similarity-check.ts` | 8-gram/embedding/web checks; write review JSON |
| `scripts/build-pdf.ts` | Typst/Pandoc build; cover, footer, sources, hash |
| `scripts/verify-provenance.ts` | Ensure every published resource has a valid manifest |
| `scripts/upload-pdfs.ts` | Upload to R2 with cache headers and metadata |

Add to `package.json`:

```json
{
  "scripts": {
    "content:audit": "tsx scripts/source-audit.ts",
    "content:gate": "tsx scripts/license-gate.ts",
    "content:verify": "tsx scripts/verify-provenance.ts",
    "content:build": "tsx scripts/build-pdf.ts",
    "content:similarity": "tsx scripts/similarity-check.ts",
    "validate": "tsx scripts/validate-content.ts && tsx scripts/verify-provenance.ts"
  }
}
```

### 13.3 Schema changes

Update `src/content.config.ts` and `description.md` §8.2 together:

- `licence` (enum),
- `source_basis[]` (url + use),
- `provenance` (path),
- `ai_assisted` (boolean),
- `reviewer` (string),
- `reviewed_at` (date),
- `similarity_score` (number),
- `file_hash` (string).

### 13.4 CI checks

- Every resource has a provenance manifest.
- Every licence is allowed for a monetised site.
- Every fact sheet exists and has a source URL.
- Similarity is below threshold.
- A human reviewer is recorded.
- PDF hash matches the manifest.
- No PDF in Git.
- No "AKTU" in the brand/domain.
- Legal pages exist and are linked.

---

## 14. 30/60/90-day plan

### Days 1–30: foundation + pilot

- [ ] Pick 3 subjects with official syllabus available.
- [ ] Build the source registry, style guide, and prompt templates.
- [ ] Run one subject end-to-end through all 7 gates.
- [ ] Publish 1 syllabus page + 5 unit notes + 1 formula sheet + 1 model paper.
- [ ] Create legal pages, disclaimer, takedown, AI disclosure.
- [ ] Have a lawyer review the PYQ and official-document policy.
- [ ] Collect reviewer sign-offs and similarity reports.

### Days 31–60: first cohort

- [ ] 10–15 subjects with notes + model papers + question banks.
- [ ] 5 PYQ pages using the link + original analysis model.
- [ ] 1 lab file + 1 viva set.
- [ ] CGPA calculator + result guide + scholarship guide.
- [ ] Weekly updates workflow with official-source verification.
- [ ] Build the similarity/provenance scripts; run them in CI.

### Days 61–90: scale + monetisation readiness

- [ ] 20–30 complete subjects.
- [ ] 50–100 original MCQs per high-traffic subject.
- [ ] All resources have provenance, reviewer, licence, and hash.
- [ ] AdSense application once content and legal pages are ready.
- [ ] Monthly content audit; remove thin/duplicate pages.
- [ ] Takedown log and corrections workflow live.

---

## 15. Red flags: stop and ask

Stop immediately if any of these are true:

- The only source is a competitor, publisher, Telegram, or unknown-licence PDF.
- The plan is "OCR → paraphrase → watermark".
- The draft has 8+ word matches with a protected source.
- The licence is NC and the page has ads.
- The licence is BY-SA and the plan adds "all rights reserved" or DRM.
- The content requires inventing subject codes, papers, dates, or `verified` data.
- The page would mirror OneView/results or collect student credentials.
- The resource has no human reviewer.
- The PDF is a scan or a re-typeset copy of someone else's file.
- The page is thin, duplicate, or has no unique value.

When in doubt: link only, publish nothing, and ask the user.

---

## 16. Definition of done for a resource

- [ ] Legal source and licence recorded in `sources.yaml`.
- [ ] Fact sheet exists; no copied prose.
- [ ] Draft written from the fact sheet, not the source.
- [ ] Similarity check passed (0 long overlaps; no prohibited-site matches).
- [ ] Fact check passed (codes, units, marks, formulas, dates).
- [ ] Subject expert reviewed and signed off.
- [ ] Diagrams/tables are original or properly licensed.
- [ ] PDF is text-based, accessible, < 25 MiB, linearized.
- [ ] Watermark/attribution is correct for the licence.
- [ ] Provenance manifest exists with hash.
- [ ] Subject YAML updated with licence, provenance, reviewer, similarity.
- [ ] Page has title, meta, canonical, JSON-LD, sources, last-updated.
- [ ] Pagefind-indexed and in the sitemap.
- [ ] `npm run build` and validation pass.
- [ ] No PDF in Git; R2 upload verified.
- [ ] Takedown contact is visible.

---

## 17. Quick reference cheat sheet

| Question | Answer |
|---|---|
| Can we rehost AKTU syllabus? | No, not without written permission. Extract facts, link the PDF, write original intros. |
| Can we rehost AKTU PYQ scans? | No. Link the official paper; write original solutions/analysis. Get legal review for transcription. |
| Can we use a competitor's notes? | No. Never ingest, OCR, paraphrase, or rehost. |
| Can we use OpenStax? | Yes, if the specific book is CC BY; attribute, link licence, state changes. |
| Can we use LibreTexts? | Check each page; CC BY/BY-SA/CC0 yes; NC link-only when ads are on. |
| Can we use MIT OCW? | Link only when ads are on (NC-SA). |
| Can we use NPTEL/NCERT? | Link only unless a specific licence says otherwise. |
| Can we use Wikipedia? | Yes, CC BY-SA: attribute, state changes, keep derivative BY-SA. |
| Can we use Project Gutenberg? | Only works public domain in India; verify author death date + 60 years. |
| Can we put our watermark on a CC BY-SA adaptation? | Yes as attribution/branding, but the derivative must stay BY-SA and must not add restrictions. |
| Can we monetise AI-generated notes? | Yes, with human authorship/review, originality, provenance, and AdSense policy compliance. |
| Does a watermark make copied content legal? | No. |
| Does paraphrasing make it legal? | Not if it is substantially similar. Use the clean-room pipeline. |
| What if we are unsure? | Link only, do not publish, ask the user/lawyer. |

---

## 18. References

- Copyright Act, 1957 (India): https://www.indiacode.nic.in/
- Creative Commons licences: https://creativecommons.org/licenses/
- CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/
- GODL-India: https://www.data.gov.in/government-open-data-license-india
- IT Rules, 2021 (intermediary/grievance): https://www.meity.gov.in/
- AKTU official: https://aktu.ac.in/
- AKTU syllabus: https://aktu.ac.in/syllabus.html
- AKTU old question papers: https://aktu.ac.in/old-question-paper.html
- OpenStax: https://openstax.org/
- LibreTexts: https://libretexts.org/
- Open Textbook Library: https://open.umn.edu/opentextbooks
- OER Commons: https://www.oercommons.org/
- Wikibooks: https://www.wikibooks.org/
- Wikimedia Commons: https://commons.wikimedia.org/
- Project Gutenberg: https://www.gutenberg.org/
- DOAJ: https://doaj.org/
- OpenAlex: https://openalex.org/
- Google AdSense policies: https://support.google.com/adsense/answer/48182
- Google Search "scaled content abuse": https://developers.google.com/search/docs/essentials/spam-policies
- Pagefind: https://pagefind.app/
- Typst: https://typst.app/
- qpdf: https://qpdf.readthedocs.io/

---

## 19. Final instruction to every agent

If you are an AI agent working in this repo:

1. Read `description.md` and this file before creating content.
2. Never treat "free to read" as "free to upload".
3. Never OCR/paraphrase/re-typeset a copyrighted scan and call it original.
4. Use the clean-room pipeline: facts → original authoring → similarity check → human review.
5. Record the licence and provenance for every resource.
6. Prefer linking to official sources over rehosting questionable files.
7. When unsure, stop and ask the user. Do not invent AKTU data.
8. Content quality and legal safety beat volume. A small, clean, original library wins.
