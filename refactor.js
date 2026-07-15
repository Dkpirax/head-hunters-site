const fs = require('fs');

const filesToUpdate = [
  'frontend/src/components/layout/Footer.tsx',
  'frontend/src/components/home/Testimonials.tsx',
  'frontend/src/components/home/Story.tsx',
  'frontend/src/components/home/ServicesBento.tsx',
  'frontend/src/components/home/JobsSection.tsx',
  'frontend/src/components/home/InsightsSection.tsx',
  'frontend/src/components/home/Hero.tsx',
  'frontend/src/components/home/GlobalReach.tsx',
  'frontend/src/components/admin/AdminNotifications.tsx',
  'frontend/src/components/admin/AccessDenied.tsx'
];

for (const file of filesToUpdate) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file}`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Replace next/link
  content = content.replace(/import Link from ["']next\/link["'];/g, 'import { Link } from "react-router-dom";');
  content = content.replace(/<Link(\s+[^>]*)href=/g, '<Link$1to=');

  // Replace next/image
  content = content.replace(/import Image from ["']next\/image["'];/g, '');
  content = content.replace(/<Image/g, '<img');

  // Replace next/navigation
  content = content.replace(/import \{.*?useRouter.*?\} from ["']next\/navigation["'];/g, 'import { useNavigate } from "react-router-dom";');
  content = content.replace(/useRouter\(\)/g, 'useNavigate()');
  content = content.replace(/router\.push/g, 'navigate');
  content = content.replace(/const router =/g, 'const navigate =');

  // Replace next/dynamic
  content = content.replace(/import dynamic from ["']next\/dynamic["'];/g, 'import { lazy, Suspense } from "react";');
  // Very basic dynamic import replacement
  content = content.replace(/dynamic\(\(\) => import\((.*?)\), \{ ssr: false \}\)/g, 'lazy(() => import($1))');
  content = content.replace(/dynamic\(\(\) => import\((.*?)\)\)/g, 'lazy(() => import($1))');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
