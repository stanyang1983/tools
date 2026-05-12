import { Resvg } from '@resvg/resvg-js';
import toIco from 'to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '../public/favicon.svg');
const icoPath = join(__dirname, '../public/favicon.ico');

const svg = readFileSync(svgPath);

const sizes = [16, 32, 48, 64];
const pngBuffers = sizes.map(size => {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  return resvg.render().asPng();
});

const ico = await toIco(pngBuffers);
writeFileSync(icoPath, ico);
console.log(`favicon.ico 已生成（${sizes.join(', ')} px）`);
