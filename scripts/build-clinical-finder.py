"""Build discovery metadata for every current published resource plus curated pathway routes."""
from pathlib import Path
from html import escape
import json,re
ROOT=Path(__file__).resolve().parents[1]
inv=json.loads((ROOT/'docs/qa/resource-inventory.json').read_text())
facets={
 'diagnosis':{'ADHD':['adhd'],'Autism':['autism','autistic'],'Anxiety / OCD':['anxiety','ocd','exposure','erp','uncertainty'],'Depression':['depression','depressed','behavioral-activation'],'Trauma / dissociation':['trauma','ptsd','dissociation','dissociative'],'Learning disorders':['dyslexia','dyscalculia','dysgraphia','learning'],'Psychosis / bipolar':['psychosis','bipolar','smi'],'Substance use':['substance','opioid','harm-reduction'],'Persistent conflict':['conflict','odd','oppositional']},
 'symptom':{'Fear / uncertainty':['anxiety','fear','uncertainty','ocd','panic'],'Low mood / energy':['depression','behavioral-activation','mood'],'Overload / distress':['overload','sensory','grounding','regulation','distress'],'Communication difficulty':['communication','language','aphasia','words','consent'],'Memory / attention':['memory','attention','adhd','executive'],'Conflict / aggression':['conflict','aggression','behavior','bullying']},
 'function':{'Starting / organizing tasks':['task','executive','adhd','plans','chores'],'Learning / school access':['school','learning','dyslexia','dyscalculia','dysgraphia','iep','504'],'Communication / participation':['communication','language','aphasia','participation','assent','consent'],'Daily living / self-care':['hygiene','personal-care','adaptive','functioning','disability'],'Relationships / family':['family','parent','sibling','peer','friendship'],'Safety / stabilization':['safety','crisis','suicide','overdose','grounding']},
 'intervention':{'CBT / behavioral activation':['cbt','behavioral-activation','depression'],'Exposure / ERP':['exposure','erp','ocd','uncertainty'],'ACT':['act-','flexibility'],'DBT / emotion regulation':['dbt','emotion-regulation','grounding'],'Family / parenting':['family','parenting','caregiver','sibling'],'Access / accommodations':['access','support','accommodation','iep','504'],'Function-linked support':['functional','formulation','abc','behavior']},
 'stage':{'Early childhood':['early-childhood','young-child','pediatric','developmental'],'School age / adolescence':['school','child','adolescent','youth','parent','homeschool','iep','504'],'Adult':['adult','personal-care','hygiene','substance','psychosis'],'Across ages / adapt to person':['communication-supports','visual-reasoning','workforce','functional-progress','assessment-question','barrier-formulation']},
 'role':{'Client / caregiver':['handouts/','guides/','homeschool/','parent','family','caregiver'],'School team':['school/','guides/','iep','504'],'Staff / case manager':['frontline','workforce','coordination','community'],'Graduate trainee':['assessment/','therapy/','trainees/','training/'],'Clinician':['assessment/','therapy/','school/clinical/','treatment-plan']},
 'task':{'Formulation':['formulation','differential','casebook','functional','understanding'],'Assessment planning':['assessment','screening','measure','evaluation'],'Treatment planning':['treatment','therapy','intervention','support-experiment'],'Client education':['handouts/','guides/','family','parent'],'Skill rehearsal / supervision':['intern','trainee','training','workforce','practice'],'Referral / coordination':['arizona/','california/','coordination','referral'],'Progress review':['progress','review','implementation','outcomes']},
 'step':{'What am I seeing?':['observation','frontline','start-here','differential','casebook'],'Understanding':['formulation','understanding','differential','casebook','clinical/'],'What should I do?':['treatment','planning','support','practical-toolkit','clinical/'],'What tool?':['toolkit','worksheet','handout','map','plan','downloads/','guide'],'What to watch next?':['progress','review','implementation','outcomes']}}
facets['diagnosis'].update({'Eating disorders':['eating','restriction','binge'],'Tic / repetitive behavior conditions':['tics','tourette','bfrb','repetitive'],'Intellectual disability':['intellectual','supported-choice'],'Sleep conditions':['insomnia','sleep-loss'],'Grief / bereavement':['grief','bereavement']})
facets['symptom'].update({'Pain / bodily concerns':['pain','health-anxiety','body-dysmorphic','body-dysmorphia'],'Sleep difficulty':['insomnia','sleep-loss'],'Eating difficulty':['eating','restriction','binge'],'Repetitive actions / urges':['ritual','tics','bfrb','checking']})
facets['function'].update({'Food / sleep / health participation':['eating','insomnia','sleep-loss','health-anxiety','chronic-pain'],'Autonomy / supported choice':['supported-choice','intellectual']})
priority=['resources/therapy/visual-reasoning-toolkit.html','resources/therapy/communication-supports-toolkit.html','resources/therapy/treatment-plan-menu.html','resources/therapy/barrier-formulation-lab.html','resources/therapy/assessment-question-to-feedback.html','resources/assessment/integrated-development-language-learning-casebook.html','resources/training/workforce-learning-center.html','resources/therapy/functional-progress-review.html']
expansion=json.loads((ROOT/'data/topic-expansion-ledger.json').read_text()) if (ROOT/'data/topic-expansion-ledger.json').exists() else {'resources':[]}
curated={r['path']:r for r in expansion['resources']}
records=[]
for r in inv['resources']:
 path=r['path']
 if r['retained_legacy'] or path.startswith('preview/') or path in ['index.html','library.html','resources/index.html','resources/complete-resource-inventory.html','resources/clinical-resource-finder.html'] or path.startswith('tools/'):continue
 title=re.split(r'\s*[|]\s*',r.get('title',Path(path).stem.replace('-',' ').title()))[0]
 searchable=(title+' '+path).lower()
 tags={k:[label for label,terms in opts.items() if any(t in searchable for t in terms)] for k,opts in facets.items()}
 if path in ['resources/therapy/communication-supports-toolkit.html','resources/therapy/visual-reasoning-toolkit.html']:
  tags['role']=['Client / caregiver','Staff / case manager','Graduate trainee','Clinician']
  tags['function']=['Communication / participation','Safety / stabilization']
  tags['symptom']=['Communication difficulty','Overload / distress']
  tags['step']=['Understanding','What should I do?','What tool?']
 if path=='resources/training/workforce-learning-center.html':
  tags['role']=['Staff / case manager','Graduate trainee','Clinician']
  tags['function']=['Communication / participation','Safety / stabilization','Relationships / family']
  tags['task']=['Skill rehearsal / supervision','Referral / coordination']
  tags['step']=['What am I seeing?','Understanding','What should I do?']
 if path=='resources/therapy/frontline-observation-coordination.html':
  tags['role']=['Staff / case manager','Graduate trainee','Clinician']
  tags['function']=['Communication / participation','Safety / stabilization']
 if path=='resources/therapy/functional-progress-review.html':
  tags['role']=['Client / caregiver','Staff / case manager','Graduate trainee','Clinician']
  tags['step']=['What to watch next?']
 # A family/plain-language diagnosis guide is not itself a clinician guide.
 if path.startswith('guides/') or '/homeschool/' in path:tags['role']=['Client / caregiver','School team']
 if '/school/clinical/' in path:tags['role']=['Clinician','School team','Graduate trainee']
 if path in curated:
  item=curated[path];kind=item['type']
  tags['stage']=['Adult'] if item['audience'].startswith('Adults') else ['School age / adolescence'] if 'child' in item['audience'].lower() else ['Across ages / adapt to person']
  tags['role']=['Client / caregiver'] if kind in ['client-workbook','care-partner'] else ['Graduate trainee','Clinician'] if kind in ['formulation','case'] else ['Client / caregiver','Staff / case manager','Graduate trainee','Clinician']
  tags['task']=['Formulation','Assessment planning','Treatment planning'] if kind=='formulation' else ['Skill rehearsal / supervision'] if kind=='case' else ['Client education'] if kind in ['client-workbook','care-partner'] else ['Progress review'] if kind=='progress-review' else ['Formulation','Treatment planning']
  tags['step']=['What am I seeing?','Understanding','What should I do?'] if kind=='formulation' else ['What to watch next?'] if kind=='progress-review' else ['What tool?','What should I do?']
 score=100-priority.index(path) if path in priority else 65 if '/school/clinical/' in path else 60 if path.startswith('guides/') else 30 if 'start-here' in path else 20
 records.append({'url':'/'+path,'title':title,'format':Path(path).suffix[1:].upper(),'tags':tags,'priority':score,'metadataBasis':'Curated audience, task and pathway; topic tags from title/path' if path in curated else 'title/path discovery tags'})
# PHASE_8B_CURATED: these routes remain indexed even before inventory regeneration.
# Source metadata is curated for navigation, not indication/effectiveness validation.
depth_routes = [
  {
    "url": "/resources/clinical-depth/index.html",
    "title": "Clinical depth: start with the decision",
    "priority": 92,
    "format": "HTML",
    "tags": {
      "diagnosis": [],
      "symptom": [],
      "function": [],
      "intervention": [],
      "stage": [
        "Across ages / adapt to person"
      ],
      "role": [
        "Clinician",
        "Graduate trainee",
        "Staff / case manager"
      ],
      "task": [
        "Formulation",
        "Assessment planning",
        "Treatment planning"
      ],
      "step": [
        "What am I seeing?",
        "Understanding",
        "What should I do?",
        "What tool?",
        "What to watch next?"
      ]
    },
    "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
  },
  {
    "url": "/resources/clinical-depth/self-harm-safety-continuity.html",
    "title": "Self-harm: assessment, safety and continuity of care",
    "priority": 91,
    "format": "HTML",
    "tags": {
      "diagnosis": [
        "Trauma / dissociation"
      ],
      "symptom": [
        "Overload / distress"
      ],
      "function": [
        "Safety / stabilization",
        "Relationships / family"
      ],
      "intervention": [],
      "stage": [
        "Across ages / adapt to person"
      ],
      "role": [
        "Clinician",
        "Graduate trainee",
        "Staff / case manager"
      ],
      "task": [
        "Assessment planning",
        "Referral / coordination",
        "Treatment planning",
        "Progress review"
      ],
      "step": [
        "What am I seeing?",
        "Understanding",
        "What should I do?",
        "What to watch next?"
      ]
    },
    "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
  },
  {
    "url": "/resources/clinical-depth/complex-dissociation-functional-care.html",
    "title": "DID and complex dissociation: differential and functional care",
    "priority": 90,
    "format": "HTML",
    "tags": {
      "diagnosis": [
        "Trauma / dissociation"
      ],
      "symptom": [
        "Memory / attention",
        "Overload / distress"
      ],
      "function": [
        "Daily living / self-care",
        "Safety / stabilization"
      ],
      "intervention": [],
      "stage": [
        "Adult"
      ],
      "role": [
        "Clinician",
        "Graduate trainee"
      ],
      "task": [
        "Assessment planning",
        "Formulation",
        "Treatment planning",
        "Progress review"
      ],
      "step": [
        "What am I seeing?",
        "Understanding",
        "What should I do?",
        "What to watch next?"
      ]
    },
    "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
  },
  {
    "url": "/resources/clinical-depth/dissociation-function-observation.html",
    "title": "Dissociation: functional memory observation worksheet",
    "priority": 87,
    "format": "HTML",
    "tags": {
      "diagnosis": [
        "Trauma / dissociation"
      ],
      "symptom": [
        "Memory / attention"
      ],
      "function": [
        "Daily living / self-care",
        "Communication / participation"
      ],
      "intervention": [],
      "stage": [
        "Adult"
      ],
      "role": [
        "Clinician",
        "Graduate trainee",
        "Client / caregiver"
      ],
      "task": [
        "Assessment planning",
        "Progress review"
      ],
      "step": [
        "What tool?",
        "What to watch next?"
      ]
    },
    "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
  },
  {
    "url": "/resources/clinical-depth/complex-personality-longitudinal-care.html",
    "title": "Complex personality: longitudinal treatment and rupture repair",
    "priority": 89,
    "format": "HTML",
    "tags": {
      "diagnosis": [
        "Trauma / dissociation"
      ],
      "symptom": [
        "Conflict / aggression",
        "Overload / distress"
      ],
      "function": [
        "Relationships / family",
        "Safety / stabilization"
      ],
      "intervention": [],
      "stage": [
        "Adult"
      ],
      "role": [
        "Clinician",
        "Graduate trainee"
      ],
      "task": [
        "Formulation",
        "Treatment planning",
        "Progress review"
      ],
      "step": [
        "Understanding",
        "What should I do?",
        "What to watch next?"
      ]
    },
    "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
  },
  {
    "url": "/resources/clinical-depth/neuropsych-evaluation-access-validity.html",
    "title": "Neuropsychological assessment: access and score validity",
    "priority": 90,
    "format": "HTML",
    "tags": {
      "diagnosis": [
        "Autism",
        "ADHD",
        "Learning disorders"
      ],
      "symptom": [
        "Communication difficulty",
        "Memory / attention"
      ],
      "function": [
        "Communication / participation",
        "Learning / school access"
      ],
      "intervention": [
        "Access / accommodations"
      ],
      "stage": [
        "Across ages / adapt to person"
      ],
      "role": [
        "Clinician",
        "Graduate trainee"
      ],
      "task": [
        "Assessment planning",
        "Formulation"
      ],
      "step": [
        "What am I seeing?",
        "Understanding",
        "What should I do?"
      ]
    },
    "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
  },
  {
    "url": "/resources/clinical-depth/assessment-decision-report-planner.html",
    "title": "Psychological evaluation: report and feedback planner",
    "priority": 86,
    "format": "HTML",
    "tags": {
      "diagnosis": [
        "Autism",
        "ADHD",
        "Learning disorders"
      ],
      "symptom": [
        "Communication difficulty"
      ],
      "function": [
        "Communication / participation"
      ],
      "intervention": [
        "Access / accommodations"
      ],
      "stage": [
        "Across ages / adapt to person"
      ],
      "role": [
        "Clinician",
        "Graduate trainee"
      ],
      "task": [
        "Assessment planning",
        "Progress review"
      ],
      "step": [
        "What tool?",
        "What to watch next?"
      ]
    },
    "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
  }
,
{
  "url": "/resources/clinical-depth/child-caregiver-treatment-selection.html",
  "title": "Child treatment selection: safety, development, caregiver and dyadic care",
  "priority": 89,
  "format": "HTML",
  "tags": {
    "diagnosis": [
      "Autism",
      "ADHD"
    ],
    "symptom": [
      "Conflict / aggression",
      "Communication difficulty",
      "Overload / distress"
    ],
    "function": [
      "Relationships / family",
      "Communication / participation",
      "Safety / stabilization"
    ],
    "intervention": [
      "Family / parenting",
      "Access / accommodations",
      "Function-linked support"
    ],
    "stage": [
      "Early childhood",
      "School age / adolescence"
    ],
    "role": [
      "Clinician",
      "Graduate trainee"
    ],
    "task": [
      "Formulation",
      "Assessment planning",
      "Treatment planning"
    ],
    "step": [
      "What am I seeing?",
      "Understanding",
      "What should I do?"
    ]
  },
  "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
},
{
  "url": "/resources/clinical-depth/caregiver-session-support-map.html",
  "title": "Before-During-After: caregiver practice and child access map",
  "priority": 86,
  "format": "HTML",
  "tags": {
    "diagnosis": [],
    "symptom": [
      "Conflict / aggression",
      "Overload / distress"
    ],
    "function": [
      "Relationships / family",
      "Communication / participation"
    ],
    "intervention": [
      "Family / parenting",
      "Access / accommodations"
    ],
    "stage": [
      "Early childhood",
      "School age / adolescence"
    ],
    "role": [
      "Clinician",
      "Graduate trainee",
      "Client / caregiver"
    ],
    "task": [
      "Client education",
      "Progress review"
    ],
    "step": [
      "What tool?",
      "What to watch next?"
    ]
  },
  "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
},
{
  "url": "/resources/clinical-depth/substance-use-cooccurring-care.html",
  "title": "Substance use and mental health: integrated clinical decision path",
  "priority": 90,
  "format": "HTML",
  "tags": {
    "diagnosis": [
      "Substance use",
      "Psychosis / bipolar",
      "Trauma / dissociation"
    ],
    "symptom": [
      "Overload / distress"
    ],
    "function": [
      "Safety / stabilization",
      "Daily living / self-care"
    ],
    "intervention": [],
    "stage": [
      "Adult"
    ],
    "role": [
      "Clinician",
      "Graduate trainee"
    ],
    "task": [
      "Formulation",
      "Assessment planning",
      "Treatment planning",
      "Referral / coordination",
      "Progress review"
    ],
    "step": [
      "What am I seeing?",
      "Understanding",
      "What should I do?",
      "What to watch next?"
    ]
  },
  "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
},
{
  "url": "/resources/clinical-depth/substance-use-parallel-care-map.html",
  "title": "Substance use: physical safety, mental health and life support map",
  "priority": 86,
  "format": "HTML",
  "tags": {
    "diagnosis": [
      "Substance use"
    ],
    "symptom": [
      "Overload / distress"
    ],
    "function": [
      "Safety / stabilization",
      "Daily living / self-care"
    ],
    "intervention": [],
    "stage": [
      "Adult"
    ],
    "role": [
      "Clinician",
      "Graduate trainee",
      "Staff / case manager",
      "Client / caregiver"
    ],
    "task": [
      "Referral / coordination",
      "Progress review",
      "Client education"
    ],
    "step": [
      "What tool?",
      "What to watch next?"
    ]
  },
  "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
}
,
{
  "url": "/resources/clinical-depth/psychosis-bipolar-longitudinal-care.html",
  "title": "Psychosis and bipolar: episode differential, coordinated care and recovery",
  "priority": 90,
  "format": "HTML",
  "tags": {
    "diagnosis": [
      "Psychosis / bipolar",
      "Substance use",
      "Trauma / dissociation"
    ],
    "symptom": [
      "Sleep difficulty",
      "Memory / attention"
    ],
    "function": [
      "Safety / stabilization",
      "Daily living / self-care"
    ],
    "intervention": [
      "CBT / behavioral activation"
    ],
    "stage": [
      "Adult"
    ],
    "role": [
      "Clinician",
      "Graduate trainee"
    ],
    "task": [
      "Formulation",
      "Assessment planning",
      "Treatment planning",
      "Referral / coordination",
      "Progress review"
    ],
    "step": [
      "What am I seeing?",
      "Understanding",
      "What should I do?",
      "What to watch next?"
    ]
  },
  "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
},
{
  "url": "/resources/clinical-depth/episode-context-function-map.html",
  "title": "Psychosis and bipolar: episode context and function timeline",
  "priority": 86,
  "format": "HTML",
  "tags": {
    "diagnosis": [
      "Psychosis / bipolar"
    ],
    "symptom": [
      "Sleep difficulty"
    ],
    "function": [
      "Safety / stabilization",
      "Daily living / self-care"
    ],
    "intervention": [],
    "stage": [
      "Adult"
    ],
    "role": [
      "Clinician",
      "Graduate trainee",
      "Client / caregiver"
    ],
    "task": [
      "Formulation",
      "Progress review"
    ],
    "step": [
      "What tool?",
      "What to watch next?"
    ]
  },
  "metadataBasis": "Phase 8B curated clinical decision/role tags; not validated indications or clinical approval"
}
]
by_url = {r['url']: r for r in records}
for route in depth_routes:
    by_url[route['url']] = route
records = list(by_url.values())
records.sort(key=lambda r:(-r['priority'],r.get('title',Path(path).stem.replace('-',' ').title()).lower()))
model={'note':'Discovery tags describe title/path coverage, not validated indications, age suitability, evidence quality, or authorization to practice. Untagged materials remain searchable. Current Colorful resources only; retained originals are in the complete inventory.','facets':{k:list(v) for k,v in facets.items()},'resources':records}
(ROOT/'data/clinical-finder.json').write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
(ROOT/'resources/clinical-finder-data.js').write_text('globalThis.CPLFinderData = '+json.dumps(model,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(records),'current resources indexed')
