// Progressive enhancement: every article remains available without JavaScript.
document.querySelectorAll('.category-posts').forEach((group) => {
  const items = Array.from(group.querySelectorAll('[data-category-post]'));
  const pageSize = Number(group.dataset.pageSize) || 10;
  if (items.length <= pageSize) return;
  const pageCount = Math.ceil(items.length / pageSize);
  let currentPage = 1;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', '文章分页');
  const list = document.createElement('ul');
  list.className = 'pagination justify-content-center flex-wrap';
  nav.append(list);
  group.append(nav);

  function showPage(page, focus = false) {
    currentPage = Math.max(1, Math.min(pageCount, page));
    items.forEach((item, index) => {
      // Bootstrap d-flex overrides the browser's default hidden style.
      const visible = Math.floor(index / pageSize) + 1 === currentPage;
      item.classList.toggle('d-flex', visible);
      item.hidden = !visible;
    });
    list.replaceChildren();
    const controls = [
      { label: '上一页', page: currentPage - 1, disabled: currentPage === 1 },
      ...Array.from({ length: pageCount }, (_, index) => ({ label: String(index + 1), page: index + 1 })),
      { label: '下一页', page: currentPage + 1, disabled: currentPage === pageCount }
    ];
    controls.forEach((control) => {
      const li = document.createElement('li');
      li.className = 'page-item';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'page-link';
      button.textContent = control.label;
      button.disabled = Boolean(control.disabled);
      if (control.disabled) li.classList.add('disabled');
      if (control.label === String(currentPage)) {
        li.classList.add('active');
        button.setAttribute('aria-current', 'page');
      }
      button.addEventListener('click', () => showPage(control.page, true));
      li.append(button);
      list.append(li);
    });
    if (focus) {
      list.querySelector('[aria-current="page"]').focus({ preventScroll: true });
      group.scrollIntoView({ block: 'start' });
    }
  }
  showPage(1);
});
