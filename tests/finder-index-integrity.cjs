const assert = require("node:assert/strict");
const path = require("node:path");

require(path.join(__dirname, "../resources/clinical-finder-data.js"));
const data = globalThis.CPLFinderData;

assert.ok(data && Array.isArray(data.resources), "Finder data must load");
const facetNames = Object.keys(data.facets);
const seenURLs = new Set();

for (const resource of data.resources) {
  assert.ok(resource.url && resource.title, "Every resource needs a title and URL");
  assert.ok(!seenURLs.has(resource.url), `Duplicate resource URL: ${resource.url}`);
  seenURLs.add(resource.url);

  assert.ok(resource.tags && typeof resource.tags === "object", `Missing tags: ${resource.url}`);
  const indexedAxes = facetNames.filter((axis) => {
    const values = resource.tags[axis];
    assert.ok(Array.isArray(values), `Missing facet array ${axis}: ${resource.url}`);
    assert.equal(new Set(values).size, values.length, `Duplicate values in ${axis}: ${resource.url}`);
    for (const value of values) {
      assert.ok(data.facets[axis].includes(value), `Unknown ${axis} value "${value}" on ${resource.url}`);
    }
    return values.length > 0;
  });
  // This is a coverage floor, not a clinical-validity claim. Tags must remain
  // grounded in the resource title, path, or reviewed page text.
  assert.ok(indexedAxes.length >= 3, `Fewer than three finder dimensions: ${resource.url}`);
}

// English topic filters and search should also surface Spanish-language materials.
const requiredTopicTags = {
  "/resources/es/school/clinical/ansiedad.html": "Anxiety / OCD",
  "/resources/es/school/plain/ansiedad.html": "Anxiety / OCD",
  "/resources/es/school/homeschool/ansiedad.html": "Anxiety / OCD",
  "/resources/es/handouts/cuando-evitar-hace-crecer-ansiedad.html": "Anxiety / OCD",
  "/resources/es/handouts/plan-incertidumbre-epr.html": "Anxiety / OCD",
  "/resources/es/school/clinical/depresion.html": "Depression",
  "/resources/es/school/plain/depresion.html": "Depression",
  "/resources/es/school/homeschool/depresion.html": "Depression",
  "/resources/es/handouts/pasos-pequenos-depresion.html": "Depression",
  "/resources/es/school/clinical/tdah.html": "ADHD",
  "/resources/es/school/plain/tdah.html": "ADHD",
  "/resources/es/school/homeschool/tdah.html": "ADHD",
  "/resources/es/handouts/comprender-conducta-ninos-autistas.html": "Autism",
  "/resources/es/handouts/conducta-ninos-autistas.html": "Autism",
  "/resources/downloads/topic-voices-collaborative-coping.pdf": "Psychosis / bipolar",
  "/resources/es/handouts/hacer-espacio-duelo.html": "Grief / bereavement",
  "/resources/es/handouts/mi-mapa-duelo.html": "Grief / bereavement",
  "/resources/es/handouts/hacer-dormir-mas-probable.html": "Sleep conditions",
  "/resources/handouts/making-sleep-more-likely.html": "Sleep conditions",
  "/resources/therapy/sleep-pain-health-psychology-start-here.html": "Sleep conditions",
  "/resources/therapy/sleep-pain-health-psychology-practical-toolkit.html": "Sleep conditions",
};

const byURL = new Map(data.resources.map((resource) => [resource.url, resource]));
for (const [url, diagnosis] of Object.entries(requiredTopicTags)) {
  const resource = byURL.get(url);
  assert.ok(resource, `Expected indexed resource: ${url}`);
  assert.ok(resource.tags.diagnosis.includes(diagnosis), `Missing English topic facet "${diagnosis}": ${url}`);
  assert.ok(Array.isArray(resource.searchTerms) && resource.searchTerms.length > 0, `Missing query aliases: ${url}`);
}

console.log(`Finder index integrity passed for ${data.resources.length} resources; minimum 3 indexed dimensions each.`);
