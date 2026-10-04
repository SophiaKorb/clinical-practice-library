/* Open the shelf named by a fragment, including links from another page. */
(() => {
  const reveal = hash => {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    for (let el = target; el; el = el.parentElement) {
      if (el.tagName === 'DETAILS') el.open = true;
    }
    requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  };
  if (location.hash) reveal(location.hash);
  window.addEventListener('hashchange', () => reveal(location.hash));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
      reveal(url.hash);
    }
  });
})();
