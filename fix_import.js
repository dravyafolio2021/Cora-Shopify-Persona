const fs = require('fs');
let content = fs.readFileSync('src/app/customer-profile/page.tsx', 'utf8');

content = content.replace(
  "import { useSearchParams, useRouter } from 'next/navigation';",
  "import { useSearchParams, useRouter } from 'next/navigation';\nimport { Playfair_Display } from 'next/font/google';\nconst playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '900'] });"
);

fs.writeFileSync('src/app/customer-profile/page.tsx', content);
