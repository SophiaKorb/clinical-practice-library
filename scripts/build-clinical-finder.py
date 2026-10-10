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
priority=['resources/therapy/visual-reasoning-toolkit.html','resources/therapy/communication-supports-toolkit.html','resources/therapy/treatment-plan-menu.html','resources/therapy/barrier-formulation-lab.html','resources/therapy/assessment-question-to-feedback.html','resources/assessment/integrated-development-language-learning-casebook.html','resources/training/workforce-learning-center.html','resources/therapy/functional-progress-review.html']
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
 score=100-priority.index(path) if path in priority else 65 if '/school/clinical/' in path else 60 if path.startswith('guides/') else 30 if 'start-here' in path else 20
 records.append({'url':'/'+path,'title':title,'format':Path(path).suffix[1:].upper(),'tags':tags,'priority':score,'metadataBasis':'title/path discovery tags'})
records.sort(key=lambda r:(-r['priority'],r.get('title',Path(path).stem.replace('-',' ').title()).lower()))
model={'note':'Discovery tags describe title/path coverage, not validated indications, age suitability, evidence quality, or authorization to practice. Untagged materials remain searchable. Current Colorful resources only; retained originals are in the complete inventory.','facets':{k:list(v) for k,v in facets.items()},'resources':records}
(ROOT/'data/clinical-finder.json').write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
(ROOT/'resources/clinical-finder-data.js').write_text('globalThis.CPLFinderData = '+json.dumps(model,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(records),'current resources indexed')
