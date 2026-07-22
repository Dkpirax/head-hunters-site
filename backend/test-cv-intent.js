// Verification test for "where do i upload the cv?" intent and conversation consent binding
// Run with: node test-cv-intent.js

const http = require('http');

async function request(method, path, body, cookieJar = {}) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const cookieHeader = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');

    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const setCookies = res.headers['set-cookie'] || [];
        const cookies = {};
        setCookies.forEach(c => {
          const [kv] = c.split(';');
          const [k, v] = kv.split('=');
          if (k && v) cookies[k.trim()] = v.trim();
        });
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), cookies });
        } catch {
          resolve({ status: res.statusCode, data, cookies });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('=== CV Upload Intent & Consent Binding Verification ===\n');

  const testPhrases = [
    'where do i upload the cv?',
    'where can I upload my resume?',
    'how do I send my CV?',
    'can I upload it here?',
    'give me the CV upload link',
    'resume upload',
    'upload cv',
    'where should I send it?'
  ];

  let passed = 0;
  for (const msg of testPhrases) {
    const c = await request('POST', '/api/chat/conversations', {});
    const cookies = c.cookies;
    const convId = c.data?.id;

    const r = await request('POST', `/api/chat/conversations/${convId}/messages`, { senderType: 'USER', content: msg }, cookies);
    const content = r.data?.message?.content || '';

    const ok = r.status === 200 && (content.includes('paperclip attachment icon') || content.includes('/upload-cv') || content.includes('full name'));
    if (ok) passed++;
    console.log(`${ok ? '✅' : '❌'} ["${msg}"] => "${content.substring(0, 90).replace(/\n/g, ' ')}"`);
  }

  console.log(`\nCV Upload Intent Test Result: ${passed}/${testPhrases.length} passed\n`);
}

runTests().catch(console.error);
