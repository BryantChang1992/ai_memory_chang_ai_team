(() => {
  const root = document.querySelector('[data-knowledge-index]');
  if (!root) return;
  const form = root.querySelector('form');
  const query = root.querySelector('#knowledge-query');
  const collection = root.querySelector('#knowledge-collection');
  const role = root.querySelector('#knowledge-role');
  const rows = [...root.querySelectorAll('[data-resource]')];
  const params = new URLSearchParams(window.location.search);
  query.value = params.get('q') || '';
  collection.value = params.get('collection') || '';
  role.value = params.get('role') || '';
  const filter = () => {
    const terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const row of rows) {
      const matches = (!collection.value || row.dataset.collection === collection.value) &&
        (!role.value || row.dataset.role === role.value) &&
        terms.every(term => row.dataset.search.toLocaleLowerCase().includes(term));
      row.hidden = !matches;
      if (matches) count++;
    }
    root.querySelector('[role="status"]').textContent = `找到 ${count} 篇内容，共 ${rows.length} 篇`;
    root.querySelector('.knowledge-empty').hidden = count !== 0;
    const url = new URL(window.location.href);
    for (const [key, value] of [['q', query.value.trim()], ['collection', collection.value], ['role', role.value]]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(null, '', url);
  };
  form.addEventListener('submit', event => event.preventDefault());
  query.addEventListener('input', filter);
  collection.addEventListener('change', filter);
  role.addEventListener('change', filter);
  form.addEventListener('reset', () => {
    query.value = ''; collection.value = ''; role.value = '';
    filter();
  });
  filter();
})();
