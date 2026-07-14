const { execSync } = require('child_process');

console.log("==========================================");
console.log("Checking database schema initialization...");
try {
    // Run db push to ensure tables exist before starting the Next.js app
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("Database initialized successfully.");
} catch (error) {
    console.error("Failed to push database schema:", error.message);
}
console.log("==========================================");

// Boot the original Next.js standalone server
require('./next-server.js');
