# Metadata schema

The catalog uses a common envelope plus type-specific fields.

## Common fields

- id: stable public identifier
- section: top-level library section
- collection: source collection or curated sub-library
- resourceType: research article, assessment tool, handout, guide, etc.
- title: human-readable title
- year: publication year when applicable
- domain: primary clinical or systems domain
- audience: intended user groups
- language: language metadata
- accessStatus: access, licensing, or retrieval status
- sourceUrl: legitimate public source or publisher page
- nextAction: remaining verification or retrieval step
- tags: search terms and controlled vocabulary helpers
- publicMetadataOnly: confirms that the record is metadata, not protected content

## Research fields

coreNumber, evidenceRole, coreStatus, caveat, evidenceReview, canonicalFilename, sourceType, and priority.

The canonical filename is an organizational target for a separate lawful PDF collection. It does not imply that a PDF is stored in this repository.

## Assessment fields

abbreviation, constructFocus, ageRange, clinicalPurpose, instrumentType, respondent, adminTime, telehealth, repeatMeasure, copyrightCaution, interpretiveLimit, evidenceStrength, outpatientUtility, and progressUtility.

Do not add test items, scoring keys, completed forms, client responses, raw scores, or local file paths to public metadata.

## Future handout and systems fields

Prefer audience, reading level, setting, topic or diagnosis, skill or goal, source or author, jurisdiction, language, last verified date, access or redistribution rights, and clinical caution.
