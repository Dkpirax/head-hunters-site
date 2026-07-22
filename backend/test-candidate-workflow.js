// Phase 2 Candidate Workflow Integration Test Suite
// Run with: node test-candidate-workflow.js

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

async function runCandidateTests() {
  console.log('=== Candidate Workflow Integration Tests ===\n');

  // Test 1: Candidate with No CV (Incomplete profile)
  console.log('--- Test 1: Candidate profile without CV ---');
  const c1 = await request('POST', '/api/chat/conversations', {});
  const cookies1 = c1.cookies;
  const id1 = c1.data?.id;

  const noCvSteps = [
    'I want to register as a candidate',
    'Kasun Perera',
    'kasun@example.com',
    '+94 77 111 2222',
    'same',
    'Colombo',
    'Software Engineer',
    'no cv',
    'yes'
  ];

  for (const step of noCvSteps) {
    const res = await request('POST', `/api/chat/conversations/${id1}/messages`, { senderType: 'USER', content: step }, cookies1);
    const text = res.data?.message?.content || '';
    console.log(`[${step}] => "${text.substring(0, 90).replace(/\n/g, ' ')}"`);
  }

  // Test 2: Double-submission protection
  console.log('\n--- Test 2: Double submission idempotency ---');
  const doubleRes = await request('POST', `/api/chat/conversations/${id1}/messages`, { senderType: 'USER', content: 'yes' }, cookies1);
  const doubleText = doubleRes.data?.message?.content || '';
  const doubleOk = doubleText.includes('already submitted') || doubleText.includes('What else');
  console.log(`${doubleOk ? '✅' : '❌'} Double 'yes' response => "${doubleText.substring(0, 90).replace(/\n/g, ' ')}"`);

  // Test 3: Post-submission routing reset
  console.log('\n--- Test 3: Post-submission question ---');
  const postRes = await request('POST', `/api/chat/conversations/${id1}/messages`, { senderType: 'USER', content: 'what jobs u have?' }, cookies1);
  const postText = postRes.data?.message?.content || '';
  const postOk = postText.includes('vacancies') || postText.includes('/jobs/');
  console.log(`${postOk ? '✅' : '❌'} Post-submission question => "${postText.substring(0, 90).replace(/\n/g, ' ')}"`);
}

runCandidateTests().catch(console.error);
