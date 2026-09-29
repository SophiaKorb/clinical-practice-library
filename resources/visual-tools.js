(() => {
  const form = document.querySelector('form[data-visual-tool]');
  if (!form) return;
  const resize = field => {
    field.style.height = 'auto';
    field.style.height = field.scrollHeight + 2 + 'px';
  };
  const fields = [...form.querySelectorAll('textarea')];
  fields.forEach(field => { resize(field); field.addEventListener('input', () => resize(field)); });
  form.addEventListener('reset', () => requestAnimationFrame(() => fields.forEach(resize)));
  window.addEventListener('beforeprint', () => fields.forEach(resize));
  window.addEventListener('afterprint', () => fields.forEach(resize));
})();
