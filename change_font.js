const fs = require('fs');

let content = fs.readFileSync('src/app/customer-profile/page.tsx', 'utf8');

// Replace imports and instantiation
content = content.replace(/import \{ Playfair_Display \} from 'next\/font\/google';/g, "import { Lato } from 'next/font/google';");
content = content.replace(/const playfair = Playfair_Display\(\{ subsets: \['latin'\], weight: \['400', '600', '700', '900'\] \}\);/g, "const lato = Lato({ subsets: ['latin'], weight: ['400', '700', '900'] });"); // Lato doesn't have 600 weight

// Replace class names
content = content.replace(/playfair\.className/g, 'lato.className');

fs.writeFileSync('src/app/customer-profile/page.tsx', content);
