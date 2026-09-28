// Export the existing AEM place components into the static preview's shared layout.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { copyDemoAsset } from './demo-assets.mjs';
import { icon } from './demo-ui.mjs';

export function buildThingsToDo({ docs, content, page, hero, button, escape, decode, filters, cards, promo, parkRecords }) {
  const base = resolve(content, 'outwiththenest/gb/en/things-to-do');
  const topCategories = [
    { slug: 'parks-and-walks', file: 'parks.html', title: 'Parks and Walks', eyebrow: 'Fresh air, room to play', description: 'Woodland wanders, open parkland and seaside picnics for a day together.', image: 'marine-lake.jpg' },
    { slug: 'museums', file: 'museums.html', title: 'Museums', eyebrow: 'Big discoveries for curious minds', description: 'Explore local stories, historic houses and remarkable aircraft at family-friendly museums.', image: 'bristol-museum.jpg' },
    { slug: 'indoor-activities', file: 'indoor-activities.html', title: 'Indoor Activities', eyebrow: 'Whatever the weather', description: 'Science, sea life, swimming and cinema: find an indoor adventure to suit your family.' },
  ];
  const getAttributes = (xml, tag) => {
    const element = xml.match(new RegExp(`<${tag}\\s[\\s\\S]*?>`))?.[0] || '';
    return Object.fromEntries([...element.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));
  };
  const parkSections = ['coastal-walks', 'woodland-trails', 'playgrounds', 'picnic-spots', 'family-walks', 'free-outdoor-fun'].map(slug => {
    const xml = readFileSync(resolve(base, 'parks-and-walks', slug, '.content.xml'), 'utf8');
    const props = getAttributes(xml, 'jcr:content');
    const intro = getAttributes(xml, 'sectionintro');
    return { slug: `parks-and-walks/${slug}`, file: slug === 'coastal-walks' ? 'activity.html' : `parks-${slug}.html`, title: props['jcr:title'], eyebrow: intro.title, description: props.shortDescription, image: copyDemoAsset(content, docs, props.featuredImage), nested: true };
  });
  const categories = [...topCategories, ...parkSections];
  for (const category of categories) {
    const xml = readFileSync(resolve(base, category.slug, '.content.xml'), 'utf8');
    category.image = copyDemoAsset(content, docs, getAttributes(xml, 'jcr:content').featuredImage);
  }
  // Keep the five moved venues' existing preview URLs; AEM uses their new category paths.
  const stableVenueUrls = new Set(['ashton-court-estate', 'blaise-castle-estate', 'oldbury-court-estate', 'salthouse-fields', 'portishead-lake-grounds']);
  const crumbs = (category, title) => `<nav class="breadcrumb wrap" aria-label="Breadcrumb"><a href="./index.html">Home</a><span>/</span><a href="./things-to-do.html">Things to Do</a>${category?.nested ? '<span>/</span><a href="./parks.html">Parks and Walks</a>' : ''}${category ? `<span>/</span><a href="./${category.file}">${escape(category.title)}</a>` : ''}${title ? `<span>/</span><span aria-current="page">${escape(title)}</span>` : ''}</nav>`;
  const renderCard = v => `<article class="place-card" data-place data-title="${escape(v.title)}" data-location="${escape(v.location)}" data-age="${escape(v.age)}" data-cost="${escape(v.cost)}" data-setting="${escape(v.setting)}">${v.image ? `<img src="./assets/images/${v.image}" alt="" loading="lazy" width="640" height="360">` : ''}<div class="card-body"><p class="eyebrow">${escape(v.category.title)}</p><h3><a href="./${v.file}">${escape(v.title)}</a></h3><p>${escape(v.description)}</p><div class="card-meta"><p class="meta-line">${icon('pin')}<span>${escape(v.location)} · ${escape(v.setting)}</span></p><div class="chips"><span>${escape(v.age)}</span><span>${escape(v.cost)}</span></div><a class="detail-link" href="./${v.file}">Plan your visit →</a></div></div></article>`;
  for (const category of categories) {
    const venues = readdirSync(resolve(base, category.slug), { withFileTypes: true }).filter(entry => entry.isDirectory() && !entry.name.startsWith('_')).flatMap(entry => {
      const xml = readFileSync(resolve(base, category.slug, entry.name, '.content.xml'), 'utf8');
      // Only export complete venue pages; subsection pages have their own listings.
      if (!/<visitorinformation\b/.test(xml)) return [];
      const props = getAttributes(xml, 'jcr:content');
      const v = { category, file: `${category.slug}-${entry.name}.html`, title: props['jcr:title'], description: props.shortDescription, location: props.location, cost: props.costType, age: props.ageGroup, setting: props.environment, image: copyDemoAsset(content, docs, props.featuredImage) };
      v.file = `${category.slug.replace(/^parks-and-walks/, 'parks').replaceAll('/', '-')}-${entry.name}.html`;
      if (category.nested && stableVenueUrls.has(entry.name)) v.file = `parks-${entry.name}.html`;
      const about = getAttributes(xml, 'placeabout');
      const info = getAttributes(xml, 'placepracticalinfo');
      const map = getAttributes(xml, 'placevisitmap');
      const visitor = getAttributes(xml, 'visitorinformation');
      // Extract only plain paragraphs and the trusted HTTPS source URL, not arbitrary authored HTML.
      const paragraphs = [...(about.description || '').matchAll(/<p>([\s\S]*?)<\/p>/g)].map(([, text]) => `<p>${escape(decode(text))}</p>`).join('');
      const official = visitor.text?.match(/href="(https:\/\/[^"<>]+)"/)?.[1];
      const body = crumbs(category, v.title) + hero({ image: v.image, eyebrow: escape(category.title), title: escape(v.title), description: escape(v.description), extra: `<div class="chips">${[v.location,v.setting,v.age,v.cost].map(t=>`<span>${escape(t)}</span>`).join('')}</div>`, cta: button('#visit', 'Plan your visit'), className: 'detail-hero' })
        + `<section class="wrap section detail-grid"><div><p class="eyebrow">${escape(about.eyebrow)}</p><h2>About this place</h2>${paragraphs}</div><aside class="practical"><h2>Practical information</h2><dl>${[['Best for','bestFor'],['Facilities','facilities'],['Parking','parking'],['Good to know','goodToKnow']].map(([label,key])=>`<dt>${label}</dt><dd>${escape(info[key] || '')}</dd>`).join('')}</dl></aside></section>`
        + `<section class="wrap section visit" id="visit"><div><p class="eyebrow">Find your way</p><h2>Plan your visit</h2><p class="visit-address">${icon('pin')}<span>${escape(map.address)}</span></p><p>Arrival postcode: <strong>${escape(map.postcode)}</strong></p><p>${escape(map.travelNote)}</p>${button(escape(map.directionsUrl), 'Directions from your location')}</div><div class="visit-map"><iframe src="${escape(map.mapEmbedUrl)}" title="Map showing ${escape(v.title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(map.address)}">Open a larger map ${icon('arrow')}</a></div></section><section class="wrap visit-note"><h2>Before you go</h2><p>Check current opening times, access and booking details with the venue.</p>${official ? `<p><a href="${escape(official)}">Official visitor information</a></p>` : ''}<a href="./${category.file}">Explore more ${escape(category.title.toLowerCase())} →</a></section>`;
      writeFileSync(resolve(docs, v.file), page(v.title, v.description, category.slug, body));
      return [v];
    });
    const count = venues.length + (category.slug === 'parks-and-walks' ? parkSections.length : 0);
    const isParkHub = category.slug === 'parks-and-walks';
    const locations = [...new Set((isParkHub ? parkRecords.flatMap(record => record.places) : venues).map(v => v.location))].sort();
    const categoryFilters = filters.replaceAll('./parks.html', `./${category.file}`).replace(/<select name="location">[\s\S]*?<\/select>/, `<select name="location"><option value="">All locations</option>${locations.map(location => `<option>${escape(location)}</option>`).join('')}</select>`);
    const collection = `<section class="wrap section" id="places"><div class="section-intro"><h2>${escape(category.eyebrow)}</h2><p>${escape(category.description)}</p></div>${categoryFilters}<div class="listing-heading"><h2>${isParkHub ? 'Explore by category' : 'Places to explore'}</h2><p id="result-count" data-singular="${isParkHub ? 'category' : 'place'}" data-plural="${isParkHub ? 'categories' : 'places'}" role="status" aria-live="polite">${count} ${isParkHub ? 'categories' : 'places'} to discover</p></div><div class="card-grid" id="results">${venues.map(renderCard).join('')}${isParkHub ? cards : ''}</div><div class="empty-state" id="empty-state" hidden><h3>No matching ${isParkHub ? 'categories' : 'places'}</h3><p>Try another search or clear your filters.</p><a class="button" href="./${category.file}#places">Show all ${isParkHub ? 'categories' : 'places'}</a></div></section>`;
    if (category.file === 'activity.html') {
      // Use the category template while retaining the established guide and URL.
      const coastal = readFileSync(resolve(docs, category.file), 'utf8');
      const guide = coastal.match(/<section class="wrap section detail-grid">[\s\S]*?(?=<\/main>)/)?.[0] || '';
      writeFileSync(resolve(docs, category.file), page(category.title, category.description, category.slug, crumbs(topCategories[0], category.title) + hero({ image: category.image, eyebrow: escape(category.eyebrow), title: escape(category.title), description: escape(category.description), cta: button('#places', 'Explore places'), className: 'compact-hero' }) + collection + guide));
    } else {
      writeFileSync(resolve(docs, category.file), page(category.title, category.description, category.slug, crumbs(category.nested ? topCategories[0] : null, category.title) + hero({ image: category.image, eyebrow: escape(category.eyebrow), title: escape(category.title), description: escape(category.description), cta: button('#places', 'Explore places'), className: 'compact-hero' }) + collection + promo));
    }
  }
  const hub = crumbs(null, '') + hero({ image: 'family-coast.png', eyebrow: 'Bristol · Clevedon · North Somerset', title: 'Things to Do', description: 'Little adventures for every kind of family day.', cta: button('#categories', 'Find your next day out') }) + `<section class="wrap section" id="categories"><h2>What shall we do today?</h2><div class="card-grid">${topCategories.map(c=>`<article class="place-card"><img src="./assets/images/${c.image}" alt="" loading="lazy" width="640" height="360"><div class="card-body"><h3><a href="./${c.file}">${escape(c.title)}</a></h3><p>${escape(c.description)}</p>${button(`./${c.file}`, 'Explore places')}</div></article>`).join('')}</div></section>`;
  writeFileSync(resolve(docs, 'things-to-do.html'), page('Things to Do', 'Find family activities around Bristol, Clevedon and North Somerset.', 'things-to-do', hub));
}
