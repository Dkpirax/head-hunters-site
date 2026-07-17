const fs = require('fs');
const files = [
  'backend/src/api/enquiries.ts',
  'backend/src/api/chat.ts',
  'backend/src/api/admin/users.ts',
  'backend/src/api/admin/conversations.ts',
  'backend/src/api/admin/articles.ts'
];
for (let f of files) {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/import \{ createId \} from '@paralleldrive\/cuid2';/g, 'import crypto from "crypto";');
  code = code.replace(/createId\(\)/g, 'crypto.randomUUID()');
  fs.writeFileSync(f, code);
}
console.log('Fixed cuid2 usages');
