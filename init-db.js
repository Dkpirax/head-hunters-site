const { execSync } = require('child_process');

console.log('Installing Prisma CLI...');
execSync('npm install prisma --no-save', { stdio: 'inherit' });

console.log('Pushing Prisma schema to the database...');
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

console.log('Database initialized successfully!');
