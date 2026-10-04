(() => {
  const key = 'barrier-guide:' + (document.body.dataset.guide || location.pathname);
  const controls = [...document.querySelectorAll('[data-save]')];
  let saved = {};
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) saved = value;
  } catch {}
  controls.forEach((el, i) => {
    const k = el.id || 'field-' + i;
    if (el.type === 'checkbox') el.checked = saved[k] === true;
    else if (typeof saved[k] === 'string') el.value = saved[k];
    el.addEventListener('input', () => {
      saved[k] = el.type === 'checkbox' ? el.checked : el.value;
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch {}
    });
  });
  document.getElementById('clearGuide')?.addEventListener('click', () => {
    if (!confirm('Clear saved selections and notes for this guide?')) return;
    saved = {};
    try { localStorage.removeItem(key); } catch {}
    controls.forEach(el => { if (el.type === 'checkbox') el.checked = false; else el.value = ''; });
  });
})();
