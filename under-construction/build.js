const fs = require('fs');
const path = require('path');

// Read the .env file
const envPath = path.join(__dirname, '.env');
let envConfig = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            // Remove quotes if present
            value = value.replace(/^(['"])(.*)\1$/, '$2');
            envConfig[key] = value;
        }
    });
} else {
    console.warn('.env file not found. Variables will be undefined.');
}

// Read the template
const templatePath = path.join(__dirname, 'index.template.html');
const outputPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(templatePath)) {
    console.error('index.template.html not found!');
    process.exit(1);
}

let htmlContent = fs.readFileSync(templatePath, 'utf8');

// Replace all variables
Object.keys(envConfig).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, envConfig[key]);
});

// Fallback replace for unreplaced variables
htmlContent = htmlContent.replace(/{{[A-Z0-9_]+}}/g, '');

// Write the final HTML file
fs.writeFileSync(outputPath, htmlContent);

console.log('Successfully generated index.html with environment variables.');
