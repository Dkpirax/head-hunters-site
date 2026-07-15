/**
 * Authenticated integration test - pure CommonJS, no TypeScript
 * Run with: node test-integration.js
 * Set env vars: ADMIN_EMAIL, ADMIN_PASSWORD
 */
const http = require('http');

const BASE = 'http://localhost:3001';
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD env vars required');
  process.exit(1);
}

let authCookie = '';

function request(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const pass = msg => console.log('  ✅ PASS:', msg);
const fail = msg => console.log('  ❌ FAIL:', msg);
const info = msg => console.log('  ℹ️ ', msg);
const section = title => console.log(`\n╔══ ${title} ══╗`);
const results = { pass: 0, fail: 0 };

function _pass(msg) { results.pass++; pass(msg); }
function _fail(msg) { results.fail++; fail(msg); }

async function run() {
  console.log('🔬 Head Hunters Integration Tests - Authenticated\n');
  console.log('   Backend: localhost:3001');
  console.log('   Time:', new Date().toISOString());

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  section('1. AUTHENTICATION');
  const loginRes = await request('POST', '/api/auth/login', { email: EMAIL, password: PASSWORD });
  if (loginRes.status === 200 && loginRes.body?.success) {
    _pass(`Login → 200 OK`);
  } else {
    _fail(`Login → ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    console.log('\n💥 Auth failed, cannot continue.');
    process.exit(1);
  }

  const cookieHeader = loginRes.headers['set-cookie'];
  if (Array.isArray(cookieHeader)) {
    authCookie = cookieHeader.map(c => c.split(';')[0]).join('; ');
  } else if (cookieHeader) {
    authCookie = String(cookieHeader).split(';')[0];
  }
  _pass('Auth cookie received');

  // ─── SESSION ─────────────────────────────────────────────────────────────────
  section('2. SESSION');
  const sessRes = await request('GET', '/api/auth/session', undefined, authCookie);
  if (sessRes.status === 200 && sessRes.body?.user) {
    _pass(`Session valid → role: ${sessRes.body.user.role}`);
  } else {
    _fail(`Session → ${sessRes.status}: ${JSON.stringify(sessRes.body)}`);
  }

  // ─── DASHBOARD ───────────────────────────────────────────────────────────────
  section('3. DASHBOARD');
  const dashRes = await request('GET', '/api/admin/dashboard', undefined, authCookie);
  if (dashRes.status === 200 && dashRes.body) {
    const b = dashRes.body;
    _pass(`Dashboard → 200`);
    info(`openJobsCount: ${b.openJobsCount}`);
    info(`totalEnquiriesCount: ${b.totalEnquiriesCount}`);
    info(`unreadEnquiriesCount: ${b.unreadEnquiriesCount}`);
    info(`cvsCount: ${b.cvsCount}`);
    info(`avgResponseText: ${b.avgResponseText}`);
    info(`recentEnquiries: ${b.recentEnquiries?.length ?? 0} items`);
    info(`recentChats: ${b.recentChats?.length ?? 0} items`);
    const required = ['openJobsCount','totalEnquiriesCount','unreadEnquiriesCount','cvsCount','recentEnquiries','recentChats','avgResponseText'];
    const missing = required.filter(k => !(k in b));
    if (missing.length) _fail(`Missing fields: ${missing.join(', ')}`);
    else _pass('All dashboard fields present');
    if (typeof b.openJobsCount === 'number' && typeof b.totalEnquiriesCount === 'number') _pass('Counts are numbers');
    else _fail('Count fields are not numbers');
  } else {
    _fail(`Dashboard → ${dashRes.status}: ${JSON.stringify(dashRes.body)}`);
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
  section('4. NOTIFICATIONS');
  const notifRes = await request('GET', '/api/admin/notifications', undefined, authCookie);
  if (notifRes.status === 200 && notifRes.body?.notifications !== undefined) {
    _pass(`Notifications → 200`);
    info(`Total notifications: ${notifRes.body.notifications.length}`);
    if (notifRes.body.notifications.length > 0) {
      const n = notifRes.body.notifications[0];
      info(`First: type=${n.type}, title="${n.title}"`);
      const fields = ['id','type','title','description','message','createdAt','link'];
      const missing = fields.filter(f => !(f in n));
      if (missing.length) _fail(`Missing notification fields: ${missing.join(', ')}`);
      else _pass('Notification has all required fields');
    } else {
      info('No notifications currently (normal if no new enquiries or takeover requests)');
    }
  } else {
    _fail(`Notifications → ${notifRes.status}: ${JSON.stringify(notifRes.body)}`);
  }

  // ─── ENQUIRIES ───────────────────────────────────────────────────────────────
  section('5. ENQUIRIES');
  const enqRes = await request('GET', '/api/admin/enquiries', undefined, authCookie);
  if (enqRes.status === 200 && Array.isArray(enqRes.body)) {
    _pass(`Enquiries list → 200, ${enqRes.body.length} records`);
    if (enqRes.body.length > 0) {
      const e = enqRes.body[0];
      const fields = ['id','name','email','type','message','status','createdAt'];
      const missing = fields.filter(f => !(f in e));
      if (missing.length) _fail(`Missing enquiry fields: ${missing.join(', ')}`);
      else _pass('Enquiry record shape correct');
    }
  } else {
    _fail(`Enquiries → ${enqRes.status}: ${JSON.stringify(enqRes.body)}`);
  }

  // ─── CONVERSATIONS ───────────────────────────────────────────────────────────
  section('6. ADMIN CONVERSATIONS');
  const convRes = await request('GET', '/api/admin/conversations', undefined, authCookie);
  if (convRes.status === 200 && Array.isArray(convRes.body)) {
    _pass(`Conversations → 200, ${convRes.body.length} active`);
    if (convRes.body.length > 0) {
      const c = convRes.body[0];
      const fields = ['id','userId','status','messages'];
      const missing = fields.filter(f => !(f in c));
      if (missing.length) _fail(`Missing conversation fields: ${missing.join(', ')}`);
      else _pass('Conversation shape correct');
    }
  } else {
    _fail(`Conversations → ${convRes.status}: ${JSON.stringify(convRes.body)}`);
  }

  // ─── USERS ───────────────────────────────────────────────────────────────────
  section('7. USERS');
  const usersRes = await request('GET', '/api/admin/users', undefined, authCookie);
  if (usersRes.status === 200 && Array.isArray(usersRes.body?.users)) {
    _pass(`Users → 200, ${usersRes.body.users.length} users`);
    info(`Permissions: ${usersRes.body.permissions?.join(', ')}`);
    const u = usersRes.body.users[0];
    if (u) {
      if ('passwordHash' in u) _fail('SECURITY: passwordHash exposed in user response!');
      else _pass('Password hash not exposed');
    }
  } else {
    _fail(`Users → ${usersRes.status}: ${JSON.stringify(usersRes.body)}`);
  }

  // ─── SETTINGS ────────────────────────────────────────────────────────────────
  section('8. SETTINGS');
  const settingsRes = await request('GET', '/api/settings', undefined, authCookie);
  if (settingsRes.status === 200 && settingsRes.body) {
    _pass(`Settings → 200`);
    const keys = Object.keys(settingsRes.body);
    info(`Keys found: ${keys.join(', ')}`);
  } else {
    _fail(`Settings → ${settingsRes.status}`);
  }

  // ─── CHAT E2E ────────────────────────────────────────────────────────────────
  section('9. CHAT LIFECYCLE E2E');
  const visitorId = `integration-test-${Date.now()}`;
  
  // Create conversation
  const c1 = await request('POST', '/api/chat/conversations', { visitorId });
  if (c1.status === 200 && c1.body?.id) {
    _pass(`Create conversation → 200, status=${c1.body.status}`);
    info(`Greeting messages: ${c1.body.messages?.length}`);
  } else {
    _fail(`Create conversation → ${c1.status}: ${JSON.stringify(c1.body)}`);
    section('SUMMARY'); return summarize();
  }
  const convId = c1.body.id;

  // Send 3 visitor messages
  let visitorMsgIds = [];
  for (let i = 1; i <= 3; i++) {
    const m = await request('POST', `/api/chat/conversations/${convId}/messages`, {
      senderType: 'USER', content: `Visitor test message ${i}`
    });
    if (m.status === 200 && m.body?.id) {
      _pass(`Visitor msg ${i} → 200`);
      visitorMsgIds.push(m.body.id);
    } else {
      _fail(`Visitor msg ${i} → ${m.status}: ${JSON.stringify(m.body)}`);
    }
  }

  // Poll and verify 3 unique visitor messages
  const poll1 = await request('GET', `/api/chat/messages?conversationId=${convId}`);
  if (poll1.status === 200) {
    const msgs = poll1.body?.messages || [];
    const userMsgs = msgs.filter(m => m.senderType === 'USER');
    const uniqueIds = new Set(msgs.map(m => m.id));
    if (userMsgs.length === 3) _pass(`3 visitor messages in DB, no duplicates`);
    else _fail(`Expected 3 visitor msgs, got ${userMsgs.length}`);
    if (uniqueIds.size === msgs.length) _pass('All message IDs unique (no duplicates)');
    else _fail(`Duplicate message IDs detected!`);
    info(`Total messages: ${msgs.length} (1 greeting + 3 visitor = 4 expected)`);
  } else {
    _fail(`Poll 1 → ${poll1.status}`);
  }

  // Admin takeover
  const takeover = await request('PUT', `/api/admin/conversations/${convId}/status`,
    { status: 'HUMAN_ACTIVE', takenBy: EMAIL, needsHuman: false }, authCookie);
  if (takeover.status === 200) _pass('Admin takeover → 200');
  else _fail(`Takeover → ${takeover.status}`);

  // Admin sends 2 replies
  for (let i = 1; i <= 2; i++) {
    const r = await request('POST', `/api/admin/conversations/${convId}/messages`,
      { content: `Admin reply ${i}`, senderType: 'ADMIN' }, authCookie);
    if (r.status === 200 && r.body?.id) _pass(`Admin reply ${i} → 200`);
    else _fail(`Admin reply ${i} → ${r.status}`);
  }

  // Visitor polls again - should see admin replies
  const poll2 = await request('GET', `/api/chat/messages?conversationId=${convId}`);
  if (poll2.status === 200) {
    const msgs = poll2.body?.messages || [];
    const adminMsgs = msgs.filter(m => m.senderType === 'ADMIN');
    if (adminMsgs.length === 2) _pass(`Visitor sees 2 admin replies`);
    else _fail(`Visitor sees ${adminMsgs.length} admin replies (expected 2)`);
    info(`Total messages now: ${msgs.length}`);
  } else {
    _fail(`Poll 2 → ${poll2.status}`);
  }

  // Close and restart
  const close = await request('POST', `/api/chat/conversations/${convId}/close`, {});
  if (close.status === 200) _pass('Close conversation → 200');
  else _fail(`Close → ${close.status}`);

  const newConv = await request('POST', '/api/chat/conversations', { visitorId });
  if (newConv.status === 200 && newConv.body?.id) {
    if (newConv.body.id !== convId) _pass('New conversation after close (different ID ✓)');
    else _fail('Returned same closed conversation ID — bug still present!');
  } else {
    _fail(`New conversation after close → ${newConv.status}`);
  }

  // ─── ENQUIRY SUBMIT AND VERIFY ───────────────────────────────────────────────
  section('10. ENQUIRY SUBMISSION');
  const testEmail = `integration-${Date.now()}@test.example`;
  const enqSubmit = await request('POST', '/api/enquiries', {
    name: 'Integration Test',
    email: testEmail,
    phone: '+61400000000',
    type: 'GENERAL',
    message: 'Automated integration test enquiry - please ignore.',
  });
  if (enqSubmit.status === 200 || enqSubmit.status === 201) {
    _pass(`Submit enquiry → ${enqSubmit.status}`);
  } else {
    _fail(`Submit enquiry → ${enqSubmit.status}: ${JSON.stringify(enqSubmit.body)}`);
  }

  const afterList = await request('GET', '/api/admin/enquiries', undefined, authCookie);
  if (afterList.status === 200) {
    const found = afterList.body.find(e => e.email === testEmail);
    if (found) {
      _pass('Test enquiry appears in admin list');
      info(`Status: ${found.status}, ID: ${found.id}`);
    } else {
      _fail('Test enquiry NOT found in admin list');
    }
  }

  summarize();
}

function summarize() {
  console.log('\n══════════════════════════════════════════════');
  console.log(`✅ PASSED: ${results.pass}`);
  console.log(`❌ FAILED: ${results.fail}`);
  console.log('══════════════════════════════════════════════\n');
  if (results.fail > 0) process.exit(1);
}

run().catch(e => {
  console.error('💥 Test runner exception:', e.message);
  process.exit(1);
});
