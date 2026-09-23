'use strict';

// Progressive enhancement: page content and links work without JavaScript.
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const narrowScreen = window.matchMedia('(max-width: 700px)');
function syncMenu() {
  toggle.hidden = !narrowScreen.matches;
  toggle.setAttribute('aria-expanded', 'false');
  navigation.hidden = narrowScreen.matches;
}
syncMenu();
narrowScreen.addEventListener('change', syncMenu);
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.hidden = !open;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && narrowScreen.matches && !navigation.hidden) {
    navigation.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }
});

const filters = document.querySelector('#filters');
if (filters) {
  const cards = [...document.querySelectorAll('[data-place]')];
  const fields = ['q', 'location', 'cost', 'setting', 'age'];
  function readURL() {
    const params = new URLSearchParams(window.location.search);
    fields.forEach(name => {
      const input = filters.elements.namedItem(name);
      input.value = params.get(name) || '';
      if (input.selectedIndex === -1) input.value = '';
    });
    applyFilters();
  }
  function applyFilters() {
    const values = Object.fromEntries(fields.map(name => [name, filters.elements.namedItem(name).value.trim()]));
    let count = 0;
    cards.forEach(card => {
      const matches = (!values.q || card.textContent.toLowerCase().includes(values.q.toLowerCase())) &&
        ['location', 'cost', 'setting'].every(name => !values[name] || card.dataset[name] === values[name]) &&
        (!values.age || card.dataset.age === 'All ages' || card.dataset.age === values.age);
      card.hidden = !matches;
      if (matches) count++;
    });
    document.querySelector('#result-count').textContent = `${count} ${count === 1 ? 'place' : 'places'} to discover`;
    document.querySelector('#empty-state').hidden = count !== 0;
  }
  function updateURL() {
    const url = new URL(window.location.href);
    fields.forEach(name => {
      const value = filters.elements.namedItem(name).value.trim();
      if (value) url.searchParams.set(name, value);
      else url.searchParams.delete(name);
    });
    // file:// previews may disallow history changes; filtering still works.
    try { window.history.replaceState(null, '', url); } catch { /* local preview */ }
    applyFilters();
  }
  filters.addEventListener('submit', event => { event.preventDefault(); updateURL(); });
  filters.addEventListener('input', updateURL);
  filters.addEventListener('change', updateURL);
  document.querySelector('#clear-filters').addEventListener('click', event => {
    event.preventDefault();
    filters.reset();
    updateURL();
  });
  window.addEventListener('popstate', readURL);
  readURL();
}
