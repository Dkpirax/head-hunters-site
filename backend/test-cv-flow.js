// End-to-end integration test suite for Candidate CV upload and Deduplication
// Run with: node test-cv-flow.js

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
  console.log('=== Candidate CV Flow & Deduplication Tests ===\n');

  console.log('--- Test 1: Phone Normalization ---');
  function normalizePhone(phone) {
    if (!phone) return undefined;
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('0') && digits.length === 10) return `+94${digits.slice(1)}`;
    if (digits.startsWith('94') && digits.length === 11) return `+${digits}`;
    if (digits.length >= 7) return `+${digits}`;
    return phone.trim();
  }

  console.log('0771112222 ->', normalizePhone('0771112222'));
  console.log('+94771112222 ->', normalizePhone('+94771112222'));
  console.log('+94 77 111 2222 ->', normalizePhone('+94 77 111 2222'));

  // Test 2: Full candidate flow via API
  console.log('\n--- Test 2: Candidate Registration End-to-End ---');
  const c1 = await request('POST', '/api/chat/conversations', {});
  const cookies1 = c1.cookies;
  const id1 = c1.data?.id;

  const steps = [
    'I want to upload my CV',
    'Nimal Perera',
    'nimal@example.com',
    '077 333 4444',
    'same',
    'Kandy',
    'DevOps Engineer',
    'no cv', // testing fallback/no-cv branch in chat
    'yes'
  ];

  for (const step of steps) {
    const res = await request('POST', `/api/chat/conversations/${id1}/messages`, { senderType: 'USER', content: step }, cookies1);
    const text = res.data?.message?.content || '';
    console.log(`[${step}] => "${text.substring(0, 90).replace(/\n/g, ' ')}"`);
  }
}

runTests().catch(console.error);
