'use strict';

// Progressive enhancement: page content and links work without JavaScript.
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const submenuToggle = document.querySelector('.submenu-toggle');
const submenu = document.querySelector('#activity-menu');
const navGroup = document.querySelector('.nav-group');
const narrowScreen = window.matchMedia('(max-width: 1080px)');
document.documentElement.classList.add('js');
submenuToggle.hidden = false;
function closeSubmenu() {
  submenu.hidden = true;
  submenuToggle.setAttribute('aria-expanded', 'false');
}
function closeMenu() {
  closeSubmenu();
  toggle.setAttribute('aria-expanded', 'false');
  navigation.hidden = narrowScreen.matches;
}
function syncMenu() {
  const focusWasHidden = narrowScreen.matches && navigation.contains(document.activeElement);
  const toggleHadFocus = document.activeElement === toggle;
  const submenuHadFocus = submenu.contains(document.activeElement);
  toggle.hidden = !narrowScreen.matches;
  closeMenu();
  if (focusWasHidden) toggle.focus();
  else if (submenuHadFocus) submenuToggle.focus();
  else if (toggleHadFocus && toggle.hidden) navigation.querySelector('a').focus();
}
syncMenu();
narrowScreen.addEventListener('change', syncMenu);
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.hidden = !open;
  if (!open) closeSubmenu();
});
submenuToggle.addEventListener('click', () => {
  const open = submenuToggle.getAttribute('aria-expanded') !== 'true';
  submenuToggle.setAttribute('aria-expanded', String(open));
  submenu.hidden = !open;
});
submenuToggle.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    submenu.hidden = false;
    submenuToggle.setAttribute('aria-expanded', 'true');
    submenu.querySelector('a').focus();
  }
});
document.addEventListener('click', event => {
  if (!navGroup.contains(event.target)) closeSubmenu();
  if (!event.target.closest('.site-header')) closeMenu();
});
navGroup.addEventListener('focusout', event => {
  if (!navGroup.contains(event.relatedTarget)) closeSubmenu();
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!submenu.hidden) {
      closeSubmenu();
      submenuToggle.focus();
    } else if (narrowScreen.matches && !navigation.hidden) {
      closeMenu();
      toggle.focus();
    }
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
      const places = card.dataset.places ? JSON.parse(card.dataset.places) : [card.dataset];
      // A category matches only when one of its child places meets all chosen filters.
      const matches = places.some(place =>
        (!values.q || `${card.textContent} ${place.title || ''} ${place.description || ''}`.toLowerCase().includes(values.q.toLowerCase())) &&
        ['location', 'cost', 'setting'].every(name => !values[name] || place[name] === values[name]) &&
        (!values.age || place.age === 'All ages' || place.age === values.age));
      card.hidden = !matches;
      if (matches) count++;
    });
    const resultCount = document.querySelector('#result-count');
    resultCount.textContent = `${count} ${count === 1 ? resultCount.dataset.singular || 'place' : resultCount.dataset.plural || 'places'} to discover`;
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
