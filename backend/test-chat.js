// Enhanced integration tests with isolated conversations for intent testing
// Run with: node test-chat.js

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
  console.log('=== 1. Isolated Intent Classification Tests ===\n');

  const tests = [
    { msg: 'hello', expectContains: ['Hello', 'Hi', 'help'] },
    { msg: 'are u ai?', expectContains: ['AI', 'bot', 'assistant'] },
    { msg: 'what can you do?', expectContains: ['Search', 'CV', 'Upload', 'vacancies'] },
    { msg: 'thank you', expectContains: ["welcome", "help"] },
    { msg: 'what jobs u have?', expectContains: ['vacanc', 'job', '/jobs/'] },
    { msg: 'I need a job', expectContains: ['vacanc', 'job', 'search'] },
    { msg: 'i need a candidate', expectContains: ['name', 'recruitment', 'requirement'] },
    { msg: 'I need a plumber', expectContains: ['hire', 'job', 'plumber'] },
    { msg: 'what are your charges?', expectContains: ["don't have confirmed information", "charges", "help"] },
    { msg: 'cancel', expectContains: ['sure', 'help', 'happy'] },
  ];

  let passed = 0;
  for (const test of tests) {
    // Each intent test gets its OWN fresh conversation
    const convRes = await request('POST', '/api/chat/conversations', {});
    const cookies = convRes.cookies;
    const convId = convRes.data?.id;

    const res = await request('POST', `/api/chat/conversations/${convId}/messages`, {
      senderType: 'USER',
      content: test.msg,
    }, cookies);

    const content = res.data?.message?.content || '';
    const preview = content.substring(0, 100).replace(/\n/g, ' ');

    let ok = res.status === 200 && content.length > 0;
    if (test.expectContains) {
      ok = ok && test.expectContains.some(s => content.toLowerCase().includes(s.toLowerCase()));
    }

    const status = ok ? '✅' : '❌';
    if (ok) passed++;

    console.log(`${status} [${test.msg}] => "${preview}"`);
  }

  console.log(`\nIsolated Intent Tests: ${passed}/${tests.length} passed\n`);

  console.log('=== 2. Post-Submission Routing Test ===\n');
  const convRes2 = await request('POST', '/api/chat/conversations', {});
  const cookies2 = convRes2.cookies;
  const convId2 = convRes2.data?.id;

  const steps = [
    'i need a candidate',
    'Shane Fernando',
    'TechCorp Lanka',
    'Senior Developer',
    '3',
    'Colombo',
    'shane@techcorp.lk',
    'yes',
  ];

  for (const step of steps) {
    await request('POST', `/api/chat/conversations/${convId2}/messages`, { senderType: 'USER', content: step }, cookies2);
  }

  // Ask for jobs immediately after submission to verify workflow state reset to IDLE
  const postSubRes = await request('POST', `/api/chat/conversations/${convId2}/messages`, {
    senderType: 'USER',
    content: 'show me available jobs',
  }, cookies2);

  const postSubContent = postSubRes.data?.message?.content || '';
  const postSubOk = postSubContent.includes('/jobs/') || postSubContent.includes('vacancies');
  console.log(`${postSubOk ? '✅' : '❌'} Post-Submission Question ('show me available jobs') => "${postSubContent.substring(0, 100).replace(/\n/g, ' ')}"`);

  console.log('\n=== 3. Double-Submission Idempotency Test ===\n');
  const convRes3 = await request('POST', '/api/chat/conversations', {});
  const cookies3 = convRes3.cookies;
  const convId3 = convRes3.data?.id;

  for (const step of ['i need a candidate', 'Shane', 'TechCorp', 'Dev', '1', 'Colombo', 'shane@test.com']) {
    await request('POST', `/api/chat/conversations/${convId3}/messages`, { senderType: 'USER', content: step }, cookies3);
  }

  const sub1 = await request('POST', `/api/chat/conversations/${convId3}/messages`, { senderType: 'USER', content: 'yes' }, cookies3);
  const sub2 = await request('POST', `/api/chat/conversations/${convId3}/messages`, { senderType: 'USER', content: 'yes' }, cookies3);

  const doubleOk = sub2.data?.message?.content.includes('already submitted') || sub2.data?.message?.content.includes('/jobs/');
  console.log(`${doubleOk ? '✅' : '❌'} Second 'yes' Submission => "${sub2.data?.message?.content.substring(0, 100).replace(/\n/g, ' ')}"`);
}

runTests().catch(console.error);
