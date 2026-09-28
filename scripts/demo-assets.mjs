import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Export the same DAM photograph used by the authored AEM component.
export function copyDemoAsset(content, docs, reference) {
  if (!reference?.startsWith('/content/dam/outwiththenest/')) return '';
  const asset = resolve(content, reference.slice('/content/'.length));
  const rendition = resolve(asset, '_jcr_content/renditions/cq5dam.web.1920.1920.jpeg');
  const original = resolve(asset, '_jcr_content/renditions/original');
  const source = existsSync(rendition) ? rendition : original;
  if (!existsSync(source)) throw new Error(`Missing DAM image: ${reference}`);
  const name = 'dam-' + reference.split('/').pop().replace(/\.[^.]+$/, '') + (existsSync(rendition) ? '.jpg' : reference.slice(reference.lastIndexOf('.')));
  mkdirSync(resolve(docs, 'assets/images'), { recursive: true });
  copyFileSync(source, resolve(docs, 'assets/images', name));
  return name;
}
