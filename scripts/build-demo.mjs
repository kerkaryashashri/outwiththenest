// Run with Node 18+: node scripts/build-demo.mjs
// Exports a curated, standalone preview using the repository's authored AEM assets.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = resolve(root, 'docs');
const content = resolve(root, 'ui.content/src/main/content/jcr_root/content');
const images = resolve(docs, 'assets/images');
mkdirSync(images, { recursive: true });
const copy = (source, name) => copyFileSync(resolve(content, source), resolve(images, name));
for (const [source, name] of [
  ['ClevedonPier.jpg', 'clevedon-pier.jpg'],
  ['HangingBridgeBristol.jpg', 'bristol-bridge.jpg'],
  ['Bristol-Museum-Art-Gallery-David-Winn-Morgan.jpg', 'bristol-museum.jpg'],
  ['marine-lake-salthouse.jpg', 'marine-lake.jpg'],
  ['sea.jpg', 'sea.jpg'],
]) copy(`dam/outwiththenest/${source}/_jcr_content/renditions/cq5dam.web.1280.1280.jpeg`, name);
copy('dam/outwiththenest/logo.png/_jcr_content/renditions/cq5dam.thumbnail.140.100.png', 'logo.png');
copy('outwiththenest/gb/en/home/_jcr_content/root/container/container/herocarousel/hero_1337301770_copy_1496400836/file', 'family-coast.png');

const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
// Read only the page metadata attributes, never render authored XML as HTML.
const records = ['coastal-walks', 'woodland-trails', 'playgrounds', 'picnic-spots', 'family-walks', 'free-outdoor-fun'].map(slug => {
  const xml = readFileSync(resolve(content, `outwiththenest/gb/en/things-to-do/parks-and-walks/${slug}/.content.xml`), 'utf8');
  const attributes = xml.match(/<jcr:content\s[\s\S]*?>/)[0];
  const get = name => decode(attributes.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] || '');
  const imageNames = { 'ClevedonPier.jpg': 'clevedon-pier.jpg', 'HangingBridgeBristol.jpg': 'bristol-bridge.jpg', 'sea.jpg': 'sea.jpg', 'marine-lake-salthouse.jpg': 'marine-lake.jpg' };
  return { slug, title: get('jcr:title'), location: get('location'), age: get('ageGroup'), cost: get('costType'), setting: get('environment'), description: get('shortDescription'), image: imageNames[get('featuredImage').split('/').pop()] };
});

const button = (href, label) => `<a class="button" href="${href}">${label} <span aria-hidden="true">→</span></a>`;
const iconTemplate = readFileSync(resolve(root, 'ui.apps/src/main/content/jcr_root/apps/outwiththenest/components/categorytiles/icons.html'), 'utf8');
const categoryIcon = name => {
  const group = [...iconTemplate.matchAll(/<g data-sly-test="([^"]+)">([\s\S]*?)<\/g>/g)].find(match => match[1].includes(`'${name}'`));
  if (!group) throw new Error(`Missing AEM category icon: ${name}`);
  return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${group[2]}</svg>`;
};
const header = current => `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="header-bar">
  <a class="brand" href="./index.html"><img src="./assets/images/logo.png" width="48" height="48" alt=""><span>Out With The Nest</span></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation" hidden>Menu <span aria-hidden="true">☰</span></button>
  <nav id="navigation" aria-label="Main navigation">
    <a href="./index.html" ${current === 'home' ? 'aria-current="page"' : ''}>Home</a>
    <a href="./parks.html" ${current === 'parks' ? 'aria-current="page"' : ''}>Parks &amp; Walks</a>
    <a href="./index.html#about">About</a>
    <form class="header-search" action="./parks.html" role="search"><label class="sr-only" for="site-search">Search places</label><input id="site-search" name="q" type="search" placeholder="Search places"><button aria-label="Search" type="submit">⌕</button></form>
  </nav>
</div></header>`;
const footer = `<footer class="site-footer" id="about"><div class="wrap footer-top"><div><h2>Out With The Nest</h2><p>Little adventures. Lovely family memories.</p><p>Bristol · Clevedon · North Somerset</p></div><div><p class="eyebrow">Go out. Make memories.</p><p class="footer-message">Happier families.<br>Brighter days together.</p><span class="heart" aria-hidden="true">♡</span></div></div><div class="wrap footer-bottom"><p>© 2026 Out With The Nest · Yashashri Kerkar</p><p>Static preview of the AEM implementation · <a href="https://github.com/kerkaryashashri/outwiththenest">View source on GitHub</a></p></div></footer>`;
const promo = `<section class="promo wrap" aria-labelledby="promo-title"><div><p class="eyebrow">More smiles. Less spending.</p><h2 id="promo-title">Big memories. Little budgets.</h2><p>Discover lovely family days out that don’t cost a fortune.</p>${button('./parks.html?cost=Free#places', 'Explore free days out')}</div></section>`;
const hero = ({ image, eyebrow, title, description, cta, extra = '', className = '' }) => `<section class="hero ${className}" aria-labelledby="page-title"><img class="hero-image" src="./assets/images/${image}" alt="" fetchpriority="high"><div class="wrap hero-inner"><div class="glass-panel"><p class="eyebrow">${eyebrow}</p><h1 id="page-title">${title}</h1><p>${description}</p>${extra}${cta || ''}</div></div></section>`;
const page = (title, description, current, body) => `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#102544"><title>${title} | Out With The Nest</title><link rel="icon" href="./assets/images/logo.png"><link rel="stylesheet" href="./assets/style.css"><script src="./assets/script.js" defer></script></head><body>${header(current)}<main id="main">${body}</main>${footer}</body></html>\n`;

const finder = `<section class="wrap finder" aria-labelledby="finder-title"><h2 id="finder-title">Find your next little adventure</h2><form action="./parks.html"><label>Where?<select name="location"><option value="">All locations</option><option>Clevedon</option><option>Bristol</option><option>North Somerset</option></select></label><label>Age group<select name="age"><option value="">All ages</option><option>Under 5s</option><option>5–11 years</option><option>12+ years</option></select></label><label>Indoor or outdoor?<select name="setting"><option value="">Any setting</option><option>Outdoors</option><option>Indoors</option></select></label><button class="button" type="submit">Find an adventure <span aria-hidden="true">→</span></button></form></section>`;
const categories = `<section class="categories"><div class="wrap"><h2>What shall we do today?</h2><div class="category-grid">${[
  ['parks', 'Parks & Walks', './parks.html'], ['swimming', 'Swimming'], ['museum', 'Museums'], ['clubs', 'Clubs'], ['birthday', 'Birthday Fun'], ['sun', 'Free Days Out', './parks.html?cost=Free#places'],
].map(([icon, title, href]) => href ? `<a class="category" href="${href}"><span class="category-icon">${categoryIcon(icon)}</span>${escape(title)}</a>` : `<div class="category upcoming"><span class="category-icon">${categoryIcon(icon)}</span>${title}<small>Coming soon</small></div>`).join('')}</div></div></section>`;
const featured = `<section class="wrap section"><h2 class="forest">Find your next little Adventure</h2><div class="card-grid featured-grid">${[
  ['Coastal wanders', 'clevedon-pier.jpg', 'Clevedon · Outdoors', './activity.html'],
  ['Room to run wild', 'bristol-bridge.jpg', 'Bristol · Outdoors', './parks.html?q=woodland#places'],
  ['Rainy days discovery', 'bristol-museum.jpg', 'Bristol · Indoors'],
].map(([title, image, location, href]) => `<article class="feature-card"><img src="./assets/images/${image}" alt="${image === 'bristol-bridge.jpg' ? 'Clifton Suspension Bridge with hot air balloons' : image === 'bristol-museum.jpg' ? 'Bristol Museum gallery' : 'Clevedon Pier at dusk'}" loading="lazy" width="640" height="480"><div><h3>${href ? `<a href="${href}">${title}<span aria-hidden="true"> →</span></a>` : title}</h3><p>${location}${href ? '' : ' · Coming soon'}</p></div></article>`).join('')}</div></section>`;
writeFileSync(resolve(docs, 'index.html'), page('Family days out', 'Discover family adventures around Bristol, Clevedon and North Somerset. A static preview of Out With The Nest.', 'home', hero({ image: 'family-coast.png', eyebrow: 'Bristol · Clevedon · North Somerset', title: 'Little adventures.<br>Lovely family memories.', description: 'Discover places to play, explore and spend time together.', cta: button('./parks.html', 'Explore parks &amp; walks') }) + finder + categories + featured + promo));

const cards = records.map(place => `<article class="place-card" data-place data-title="${escape(place.title)}" data-location="${escape(place.location)}" data-age="${escape(place.age)}" data-cost="${escape(place.cost)}" data-setting="${escape(place.setting)}">
<img src="./assets/images/${place.image}" alt="" loading="lazy" width="640" height="360"><div class="card-body"><h3>${place.slug === 'coastal-walks' ? `<a href="./activity.html">${escape(place.title)} <span aria-hidden="true">→</span></a>` : escape(place.title)}</h3>${place.description ? `<p>${escape(place.description)}</p>` : ''}<div class="card-meta"><p>${escape(place.location)} <span aria-hidden="true">·</span> ${escape(place.setting)}</p><div class="chips"><span>${escape(place.age)}</span><span>${escape(place.cost)}</span></div>${place.slug === 'coastal-walks' ? '<a class="detail-link" href="./activity.html">Plan your visit →</a>' : '<p class="preview-label">Listing preview</p>'}</div></div></article>`).join('');
const filters = `<form class="filters" action="./parks.html" id="filters"><label>Search places<input type="search" name="q" placeholder="e.g. coastal walks"></label><label>Location<select name="location"><option value="">All locations</option><option>Clevedon</option><option>Bristol</option><option>North Somerset</option></select></label><label>Cost<select name="cost"><option value="">Any cost</option><option>Free</option><option>Paid</option></select></label><label>Setting<select name="setting"><option value="">Any setting</option><option>Outdoors</option><option>Indoors</option></select></label><label>Age group<select name="age"><option value="">All ages</option><option>Under 5s</option><option>5–11 years</option><option>12+ years</option></select></label><button type="submit" class="button">Find places</button><a href="./parks.html#places" id="clear-filters">Clear filters</a></form>`;
writeFileSync(resolve(docs, 'parks.html'), page('Parks and Walks', 'Explore parks, coastal walks and woodland adventures from our AEM demo collection.', 'parks', `<div class="breadcrumb wrap"><a href="./index.html">Home</a><span aria-hidden="true">/</span><span>Parks and Walks</span></div>` + hero({ image: 'marine-lake.jpg', eyebrow: 'Fresh air · Little adventure', title: 'Parks and<br>Walks', description: 'Open spaces, coastal walks and woodland wonders for a lovely day together.', cta: button('./activity.html', 'Coastal Walks'), className: 'compact-hero' }) + `<section class="wrap section" id="places"><div class="section-intro"><h2>A little fresh air, a lot of adventure</h2><p>Find your next favourite spot around Bristol, Clevedon and North Somerset.</p></div>${filters}<div class="listing-heading"><h2>Places to explore</h2><p id="result-count" role="status" aria-live="polite">6 places to discover</p></div><p class="collection-note">A sample of our authored places. Open Coastal Walks for the full detail preview.</p><noscript><p>JavaScript is needed to filter this collection. All six places are shown below.</p></noscript><div class="card-grid" id="results">${cards}</div><div class="empty-state" id="empty-state" hidden><h3>No matching places in this preview</h3><p>Try another search or clear your filters to see all six places.</p><a class="button" href="./parks.html#places">Show all places</a></div></section>` + promo));

const coastal = records[0];
const detail = `<div class="breadcrumb wrap"><a href="./index.html">Home</a><span aria-hidden="true">/</span><a href="./parks.html">Parks and Walks</a><span aria-hidden="true">/</span><span>Coastal Walks</span></div>` + hero({ image: 'clevedon-pier.jpg', eyebrow: 'Plan a family day out', title: 'Coastal Walks', description: escape(coastal.description), extra: '<div class="chips"><span>Clevedon</span><span>Outdoors</span><span>All ages</span><span>Free</span></div>', cta: button('#visit', 'Plan your visit'), className: 'detail-hero' }) + `<section class="wrap section detail-grid"><div><p class="eyebrow">Explore Clevedon</p><h2>About this place</h2><p>Clevedon’s coastal paths offer a wonderful mix of sea views, interesting landmarks and fresh air, making them perfect for family adventures. Stroll along the seafront, take in views of the iconic pier, spot wildlife and enjoy plenty of space for little legs to explore.</p><p>Whether you choose a gentle walk by the water or a longer wander along the coastline, this is a lovely place to slow down, enjoy the scenery and make happy memories together.</p><img class="detail-photo" src="./assets/images/marine-lake.jpg" alt="Sailing on Clevedon Marine Lake" width="640" height="420" loading="lazy"></div><aside class="practical"><h2>Practical information</h2><dl><dt>Best for</dt><dd>Families looking for an easy-going walk, sea views, fresh air and plenty of space for children to explore.</dd><dt>Facilities</dt><dd>Cafés, benches and toilets can be found close to the seafront and Clevedon Pier area.</dd><dt>Parking</dt><dd>Several public car parks are available around Clevedon town centre and near the seafront.</dd><dt>Good to know</dt><dd>The main promenade is mostly flat and buggy-friendly. Some coastal paths may be uneven or muddy after rain, so sturdy shoes are useful.</dd></dl></aside></section><section class="wrap visit section" id="visit"><div><p class="eyebrow">A little planning, a lovely day</p><h2>Plan your visit</h2><p>Clevedon Pier, The Beach, Clevedon, BS21 7QU</p><p>Clevedon town centre has several public car parks within walking distance. The seafront promenade is mostly flat and suitable for buggies and scooters.</p>${button('https://www.google.com/maps/search/?api=1&amp;query=Clevedon+Pier+BS21+7QU', 'Open in Google Maps')}</div><div class="visit-note"><span aria-hidden="true">⌖</span><h3>Meet you by the sea</h3><p>Explore the waterfront, pause for a picnic and make a day of it.</p><a href="./parks.html">← Back to parks and walks</a></div></section>`;
writeFileSync(resolve(docs, 'activity.html'), page('Coastal Walks', coastal.description, 'detail', detail));
writeFileSync(resolve(docs, '.nojekyll'), '');
console.log('Built docs/index.html, docs/parks.html and docs/activity.html with local AEM images.');
