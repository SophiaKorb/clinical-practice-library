// Explicit source-provenance boundaries on the exhaustive HTML source-links register.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const d=JSON.parse(fs.readFileSync('review-artifacts/cpl-external-source-links.json','utf8'));
assert.equal(d.resources.length,741,'One provenance row required per HTML resource');
assert.equal(new Set(d.resources.map(r=>r.resource)).size,741,'Resource paths must be unique');
assert.equal(d.summary.linkedSourcesExtracted,d.links.length);
assert.ok(d.links.length>300,'External citation extraction unexpectedly low');
assert.ok(d.links.every(r=>r.url.startsWith('https://')||r.url.startsWith('http://')));
assert.ok(d.links.every(r=>r.clinicalSourceAccuracy==='NOT_VERIFIED'&&r.rightsClearance==='PENDING_HUMAN'&&r.publicationApproval==='NOT_AUTHORIZED'));
assert.ok(d.resources.every(r=>r.clinicalApproval==='PENDING_HUMAN'&&r.publicationApproval==='NOT_AUTHORIZED'));
const asq=d.links.filter(r=>r.url.includes('nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials')&&r.resource.includes('free-official-measure-source-guide'));
assert.ok(asq.length,'Known primary NIMH citation not enumerated');
assert.ok(d.links.every(x=>Array.isArray(x.matchedEvidenceIds)));
console.log('PASS exhaustive source-link register: '+d.resources.length+' HTML pages and '+d.links.length+' unverified citation links, exact-path evidence cross-references only');
