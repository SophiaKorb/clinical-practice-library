// Native disclosures work without JavaScript. Deep links open the matching route.
(() => {
  function openLinkedRoute() {
    const target = document.getElementById(window.location.hash.slice(1));
    const route = target?.closest('details.route');
    if (!route) return;
    route.open = true;
    // Hash navigation may run while the disclosure is still closed.
    target.scrollIntoView({ block: 'start' });
  }
  openLinkedRoute();
  window.addEventListener('hashchange', openLinkedRoute);

  // Include each route in print output, then restore the reader's disclosures.
  let printState;
  window.addEventListener('beforeprint', () => {
    if (printState) return;
    printState = [...document.querySelectorAll('details.route')].map(route => [route, route.open]);
    printState.forEach(([route]) => { route.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printState?.forEach(([route, wasOpen]) => { route.open = wasOpen; });
    printState = undefined;
  });
})();
