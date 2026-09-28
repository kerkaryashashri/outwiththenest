// Shared, decorative line icons. Labels remain readable without the graphics.
const paths = {
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  heart: '<path d="m12 21-8-8C-2 6 6-1 12 6c6-7 14 0 8 7Z"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
  facilities: '<path d="M4 5h12v9a5 5 0 0 1-10 0V5m10 1h2a3 3 0 0 1 0 6h-2M3 21h18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
  family: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 4a4 4 0 0 1 3 4v2"/>',
  outdoors: '<path d="m12 2-7 9h3l-5 7h18l-5-7h3ZM12 18v4"/>',
  indoors: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
  museum: '<path d="m3 9 9-6 9 6ZM3 21h18M5 12v6m7-6v6m7-6v6"/>',
  ticket: '<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4ZM15 6v2m0 3v2m0 3v2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
};
export const icon = name => {
  if (!paths[name]) throw new Error(`Unknown detail icon: ${name}`);
  return `<svg class="icon icon--${name}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
};

export function enhanceDetails(html) {
  const details = { 'Best for': 'heart', Facilities: 'facilities', Parking: 'parking', 'Good to know': 'info' };
  return html.replace(/<dt>(Best for|Facilities|Parking|Good to know)<\/dt><dd>([\s\S]*?)<\/dd>/g,
    (_, label, content) => `<div class="practical-item"><dt><span class="detail-icon">${icon(details[label])}</span>${label}</dt><dd>${content}</dd></div>`)
    .replace(/<div class="chips">([\s\S]*?)<\/div>/g, (_, chips) => `<div class="chips">${chips.replace(/<span>([^<]*)<\/span>/g, (_, label) => {
      const name = label === 'Outdoors' ? 'outdoors' : label === 'Indoors' ? 'indoors' : /Free|Paid/.test(label) ? 'ticket' : /ages|years|Under|\d\+/.test(label) ? 'family' : 'pin';
      return `<span class="chip">${icon(name)}<span class="chip-label">${label}</span></span>`;
    })}</div>`);
}

export function staticHeader(current) {
  const active = !['home', 'credits'].includes(current);
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="header-bar">
  <a class="brand" href="./index.html"><img src="./assets/images/logo.png" width="48" height="48" alt=""><span>Out With The Nest</span></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation" hidden><span class="menu-label">Menu</span>${icon('menu')}${icon('close')}</button>
  <nav class="site-nav" id="navigation" aria-label="Main navigation">
    <a href="./index.html" ${current === 'home' ? 'aria-current="page"' : ''}>Home</a>
    <div class="nav-group">
      <div class="nav-group-heading"><a href="./things-to-do.html" ${active ? 'class="is-current"' : ''} ${current === 'things-to-do' ? 'aria-current="page"' : ''}>Things to Do</a><button class="submenu-toggle" type="button" aria-label="Browse Things to Do categories" aria-expanded="false" aria-controls="activity-menu" hidden>${icon('chevron')}</button></div>
      <div class="nav-dropdown" id="activity-menu">
        <a href="./things-to-do.html">All things to do ${icon('arrow')}</a>
        <a href="./parks.html">${icon('outdoors')}Parks and Walks</a>
        <a href="./museums.html">${icon('museum')}Museums</a>
        <a href="./indoor-activities.html">${icon('indoors')}Indoor Activities</a>
        <a href="./parks.html?cost=Free#places">${icon('ticket')}Free Days Out</a>
      </div>
    </div>
    <a href="./index.html#about">About</a>
    <form class="header-search" action="./parks.html" role="search"><label class="sr-only" for="site-search">Search places</label><input id="site-search" name="q" type="search" placeholder="Search places"><button aria-label="Search" type="submit">${icon('search')}</button></form>
  </nav>
</div></header>`;
}
