/**
 * End-to-end authenticated integration test script
 * Uses environment variables - DO NOT hardcode credentials here
 * Run with: npx ts-node test-integration.ts
 */
import https from 'https';
import http from 'http';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3001';
const EMAIL = process.env.ADMIN_EMAIL || '';
const PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!EMAIL || !PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD env vars required');
  process.exit(1);
}

let authCookie = '';

async function request(
  method: string,
  path: string,
  body?: any,
  cookie?: string
): Promise<{ status: number; body: any; headers: Record<string, string | string[]> }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const options: http.RequestOptions = {
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode || 0,
            body: parsed,
            headers: res.headers as Record<string, string | string[]>,
          });
        } catch {
          resolve({ status: res.statusCode || 0, body: data, headers: res.headers as any });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function pass(msg: string) { console.log('  ✅ PASS:', msg); }
function fail(msg: string) { console.log('  ❌ FAIL:', msg); }
function info(msg: string) { console.log('  ℹ️ ', msg); }
function section(title: string) { console.log('\n═══', title, '═══'); }

async function runTests() {
  console.log('🔬 Head Hunters Integration Tests\n');

  // ─── 1. AUTH FLOW ───────────────────────────────────────────────────────────
  section('1. AUTHENTICATION');
  
  const loginRes = await request('POST', '/api/auth/login', {
    email: EMAIL,
    password: PASSWORD,
  });
  
  if (loginRes.status === 200 && loginRes.body?.success) {
    pass(`Login → 200 OK`);
  } else {
    fail(`Login → ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    console.log('\n💥 Cannot continue without auth. Exiting.');
    process.exit(1);
  }

  // Extract cookie
  const setCookieHeader = loginRes.headers['set-cookie'];
  if (Array.isArray(setCookieHeader)) {
    authCookie = setCookieHeader.map(c => c.split(';')[0]).join('; ');
  } else if (typeof setCookieHeader === 'string') {
    authCookie = setCookieHeader.split(';')[0];
  }

  if (!authCookie) {
    fail('No auth cookie received');
    process.exit(1);
  }
  pass('Auth cookie received (not displayed)');

  // ─── 2. SESSION ─────────────────────────────────────────────────────────────
  section('2. SESSION');
  const sessionRes = await request('GET', '/api/auth/session', undefined, authCookie);
  if (sessionRes.status === 200 && sessionRes.body?.user?.email) {
    pass(`Session → 200, email confirmed (not displayed)`);
    info(`Role: ${sessionRes.body.user.role}`);
  } else {
    fail(`Session → ${sessionRes.status}: ${JSON.stringify(sessionRes.body)}`);
  }

  // ─── 3. DASHBOARD ───────────────────────────────────────────────────────────
  section('3. DASHBOARD');
  const dashRes = await request('GET', '/api/admin/dashboard', undefined, authCookie);
  if (dashRes.status === 200 && dashRes.body) {
    pass(`Dashboard → 200`);
    info(`Open jobs: ${dashRes.body.openJobsCount}`);
    info(`Total enquiries: ${dashRes.body.totalEnquiriesCount}`);
    info(`Unread enquiries: ${dashRes.body.unreadEnquiriesCount}`);
    info(`CVs received: ${dashRes.body.cvsCount}`);
    info(`Avg response: ${dashRes.body.avgResponseText}`);
    info(`Recent enquiries count: ${dashRes.body.recentEnquiries?.length ?? 0}`);
    info(`Recent chats count: ${dashRes.body.recentChats?.length ?? 0}`);
    const missing = [];
    if (!('openJobsCount' in dashRes.body)) missing.push('openJobsCount');
    if (!('recentEnquiries' in dashRes.body)) missing.push('recentEnquiries');
    if (!('recentChats' in dashRes.body)) missing.push('recentChats');
    if (!('avgResponseText' in dashRes.body)) missing.push('avgResponseText');
    if (missing.length) fail(`Missing fields: ${missing.join(', ')}`);
    else pass('All required dashboard fields present');
  } else {
    fail(`Dashboard → ${dashRes.status}: ${JSON.stringify(dashRes.body)}`);
  }

  // ─── 4. NOTIFICATIONS ───────────────────────────────────────────────────────
  section('4. NOTIFICATIONS');
  const notifRes = await request('GET', '/api/admin/notifications', undefined, authCookie);
  if (notifRes.status === 200 && Array.isArray(notifRes.body?.notifications)) {
    pass(`Notifications → 200`);
    info(`Notification count: ${notifRes.body.notifications.length}`);
    if (notifRes.body.notifications.length > 0) {
      const n = notifRes.body.notifications[0];
      info(`First notification type: ${n.type}, title: ${n.title}`);
    }
  } else {
    fail(`Notifications → ${notifRes.status}: ${JSON.stringify(notifRes.body)}`);
  }

  // ─── 5. ENQUIRIES ───────────────────────────────────────────────────────────
  section('5. ENQUIRIES');
  const enqRes = await request('GET', '/api/admin/enquiries', undefined, authCookie);
  if (enqRes.status === 200 && Array.isArray(enqRes.body)) {
    pass(`Enquiries → 200, ${enqRes.body.length} records`);
    if (enqRes.body.length > 0) {
      const e = enqRes.body[0];
      const fields = ['id','name','email','type','message','status','createdAt'];
      const missing = fields.filter(f => !(f in e));
      if (missing.length) fail(`Missing fields on enquiry: ${missing.join(', ')}`);
      else pass('Enquiry record has all required fields');
    }
  } else {
    fail(`Enquiries → ${enqRes.status}: ${JSON.stringify(enqRes.body)}`);
  }

  // ─── 6. CONVERSATIONS ───────────────────────────────────────────────────────
  section('6. CONVERSATIONS (Admin)');
  const convRes = await request('GET', '/api/admin/conversations', undefined, authCookie);
  if (convRes.status === 200 && Array.isArray(convRes.body)) {
    pass(`Conversations → 200, ${convRes.body.length} active conversations`);
    if (convRes.body.length > 0) {
      const c = convRes.body[0];
      const fields = ['id','userId','status','messages'];
      const missing = fields.filter(f => !(f in c));
      if (missing.length) fail(`Missing fields: ${missing.join(', ')}`);
      else pass('Conversation record has all required fields');
    }
  } else {
    fail(`Conversations → ${convRes.status}: ${JSON.stringify(convRes.body)}`);
  }

  // ─── 7. USERS ───────────────────────────────────────────────────────────────
  section('7. USERS');
  const usersRes = await request('GET', '/api/admin/users', undefined, authCookie);
  if (usersRes.status === 200 && Array.isArray(usersRes.body?.users)) {
    pass(`Users → 200, ${usersRes.body.users.length} users`);
    info(`Available permissions: ${usersRes.body.permissions?.join(', ')}`);
  } else {
    fail(`Users → ${usersRes.status}: ${JSON.stringify(usersRes.body)}`);
  }

  // ─── 8. SETTINGS ─────────────────────────────────────────────────────────────
  section('8. SETTINGS');
  const settingsRes = await request('GET', '/api/settings', undefined, authCookie);
  if (settingsRes.status === 200) {
    pass(`Settings → 200`);
    const keys = Object.keys(settingsRes.body || {});
    info(`Setting keys: ${keys.slice(0, 6).join(', ')}...`);
  } else {
    fail(`Settings → ${settingsRes.status}`);
  }

  // ─── 9. CHAT LIFECYCLE ───────────────────────────────────────────────────────
  section('9. CHAT LIFECYCLE (End-to-End)');
  
  const visitorId = `test-visitor-${Date.now()}`;
  info(`Using visitor ID: ${visitorId.substring(0,20)}...`);
  
  // Create conversation
  const convCreateRes = await request('POST', '/api/chat/conversations', { visitorId });
  if (convCreateRes.status === 200 && convCreateRes.body?.id) {
    pass(`Create conversation → 200`);
    info(`Status: ${convCreateRes.body.status}, Messages: ${convCreateRes.body.messages?.length}`);
  } else {
    fail(`Create conversation → ${convCreateRes.status}: ${JSON.stringify(convCreateRes.body)}`);
    return;
  }
  const convId = convCreateRes.body.id;

  // Send visitor messages
  for (let i = 1; i <= 3; i++) {
    const msgRes = await request('POST', `/api/chat/conversations/${convId}/messages`, {
      senderType: 'USER',
      content: `Test visitor message ${i}`,
    });
    if (msgRes.status === 200 && msgRes.body?.id) {
      pass(`Visitor message ${i} sent → 200`);
    } else {
      fail(`Visitor message ${i} → ${msgRes.status}: ${JSON.stringify(msgRes.body)}`);
    }
  }

  // Poll messages - verify all 3 + greeting = 4 total
  const pollRes = await request('GET', `/api/chat/messages?conversationId=${convId}`);
  if (pollRes.status === 200 && Array.isArray(pollRes.body?.messages)) {
    const msgs = pollRes.body.messages;
    pass(`Poll messages → 200, ${msgs.length} total (expected 4: 1 greeting + 3 visitor)`);
    const userMsgs = msgs.filter((m: any) => m.senderType === 'USER');
    if (userMsgs.length === 3) pass('Exactly 3 visitor messages in DB (no duplicates)');
    else fail(`Expected 3 visitor messages, got ${userMsgs.length} — possible duplicate bug`);
  } else {
    fail(`Poll → ${pollRes.status}: ${JSON.stringify(pollRes.body)}`);
  }

  // Admin takeover
  const takeoverRes = await request('PUT', `/api/admin/conversations/${convId}/status`,
    { status: 'HUMAN_ACTIVE', takenBy: EMAIL, needsHuman: false }, authCookie
  );
  if (takeoverRes.status === 200) pass('Admin takeover → 200');
  else fail(`Takeover → ${takeoverRes.status}`);

  // Admin sends 2 replies
  for (let i = 1; i <= 2; i++) {
    const replyRes = await request('POST', `/api/admin/conversations/${convId}/messages`,
      { content: `Admin reply ${i}`, senderType: 'ADMIN' }, authCookie
    );
    if (replyRes.status === 200 && replyRes.body?.id) pass(`Admin reply ${i} → 200`);
    else fail(`Admin reply ${i} → ${replyRes.status}`);
  }

  // Visitor polls again - expect 4 + 2 = 6 messages
  const poll2Res = await request('GET', `/api/chat/messages?conversationId=${convId}`);
  if (poll2Res.status === 200) {
    const msgs = poll2Res.body.messages;
    pass(`After admin replies: ${msgs.length} total messages`);
    const adminMsgs = msgs.filter((m: any) => m.senderType === 'ADMIN');
    if (adminMsgs.length === 2) pass('Exactly 2 admin messages, no duplicates');
    else fail(`Expected 2 admin messages, got ${adminMsgs.length}`);
  } else {
    fail(`Second poll → ${poll2Res.status}`);
  }

  // Close conversation
  const closeRes = await request('POST', `/api/chat/conversations/${convId}/close`, {});
  if (closeRes.status === 200) pass('Close conversation → 200');
  else fail(`Close → ${closeRes.status}`);

  // Recreate with same visitor - should get NEW conversation
  const newConvRes = await request('POST', '/api/chat/conversations', { visitorId });
  if (newConvRes.status === 200 && newConvRes.body?.id && newConvRes.body.id !== convId) {
    pass('New conversation created after close (different ID) ✓');
  } else if (newConvRes.status === 200 && newConvRes.body?.id === convId) {
    fail('Same closed conversation returned — "start fresh" bug still present!');
  } else {
    fail(`New conversation after close → ${newConvRes.status}`);
  }

  // ─── 10. PUBLIC ENQUIRY SUBMIT ───────────────────────────────────────────────
  section('10. PUBLIC ENQUIRY SUBMISSION');
  const enquiryRes = await request('POST', '/api/enquiries', {
    name: 'Integration Test User',
    email: 'test@integration.example.com',
    phone: '+61400000000',
    type: 'GENERAL',
    message: 'This is an automated integration test enquiry. Please ignore.',
  });
  if (enquiryRes.status === 200 || enquiryRes.status === 201) {
    pass(`Submit enquiry → ${enquiryRes.status}`);
  } else {
    fail(`Submit enquiry → ${enquiryRes.status}: ${JSON.stringify(enquiryRes.body)}`);
  }

  // Check it appears in admin
  const afterEnqRes = await request('GET', '/api/admin/enquiries', undefined, authCookie);
  if (afterEnqRes.status === 200) {
    const testEnq = afterEnqRes.body.find((e: any) => e.email === 'test@integration.example.com');
    if (testEnq) pass('Test enquiry visible in admin list');
    else fail('Test enquiry NOT found in admin list after submission');
  }

  console.log('\n══════════════════════════════════');
  console.log('✅ Integration tests complete');
  console.log('══════════════════════════════════\n');
}

runTests().catch(e => {
  console.error('❌ Test runner failed:', e.message);
  process.exit(1);
});
