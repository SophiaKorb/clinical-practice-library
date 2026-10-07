(() => {
  const examples = [...document.querySelectorAll('details.example')];
  if (!examples.length) return;
  let printState = null;
  const preparePrint = () => {
    if (printState) return;
    printState = examples.map(example => example.open);
    examples.forEach(example => { example.open = true; });
  };
  const restorePrint = () => {
    if (printState) examples.forEach((example, i) => { example.open = printState[i]; });
    printState = null;
    document.body.classList.remove('print-single');
    document.querySelectorAll('.print-selected').forEach(tool => tool.classList.remove('print-selected'));
  };
  document.querySelector('[data-expand-tools]').addEventListener('click', () => examples.forEach(example => { example.open = true; }));
  document.querySelector('[data-collapse-tools]').addEventListener('click', () => examples.forEach(example => { example.open = false; }));
  document.querySelector('[data-print-tools]').addEventListener('click', () => window.print());
  examples.forEach(example => {
    const tool = example.closest('.tool');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'print-tool';
    button.textContent = 'Print this visual';
    button.setAttribute('aria-label', 'Print ' + tool.querySelector('h3').textContent);
    button.addEventListener('click', () => {
      document.body.classList.add('print-single');
      tool.classList.add('print-selected');
      window.print();
    });
    example.appendChild(button);
  });
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', restorePrint);
})();
