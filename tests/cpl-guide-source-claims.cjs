// Approval boundaries for narrow Arizona school-rights source comparisons.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const x=JSON.parse(fs.readFileSync('docs/qa/2026-11-13-school-guide-primary-claims.json','utf8'));
assert.equal(x.checks.length,5);
assert.equal(x.legalReviewed,false);
assert.equal(x.releaseApproved,false);
assert.ok(x.checks.every(c=>c.sourceOwner&&c.sourceUrl.startsWith('https://')&&c.localFile&&c.finding&&c.scopeLimit&&c.humanApproval===false));
const flagged=x.checks.find(c=>c.id==='AZ-SPANISH-CONSENT-START');
assert.ok(flagged&&flagged.sourceContentChanged===false&&flagged.candidateReplacementForHumanApproval&&flagged.status==='POTENTIAL_FACTUAL_AMBIGUITY_NEEDS_BILINGUAL_LEGAL_REVIEW');
const html=fs.readFileSync(flagged.localFile,'utf8');
assert.ok(html.includes(flagged.quotedLocalText),'Flagged Spanish wording changed without reconciling the source ledger');
console.log('PASS 5 bounded primary-government source checks, Spanish issue flagged and all approvals withheld');
