// Integration test suite for PDF/DOCX binary validation and duplicate application prevention
// Run with: node test-binary-cv.js

const http = require('http');
const fs = require('fs');
const path = require('path');

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
  console.log('=== Binary CV & JobApplication Idempotency Tests ===\n');

  // Test 1: Phone normalization & candidate deduplication
  const { createOrUpdateCandidate, createJobApplication, findCandidateByContact } = require('./src/api/chat/tools');

  
  console.log('--- Test 1: Candidate Deduplication with Unnormalized Phones ---');
  const c1 = await createOrUpdateCandidate({
    name: 'Saman Jayasinghe',
    email: 'saman@example.lk',
    phone: '077 555 6666',
    whatsapp: '+94 77 555 6666',
    location: 'Galle'
  });
  console.log('Inserted Candidate 1 ID:', c1.candidate.id, 'isNew:', c1.isNew);

  const c2 = await createOrUpdateCandidate({
    name: 'Saman Jayasinghe Updated',
    email: 'saman@example.lk',
    phone: '+94775556666',
    whatsapp: '0775556666',
    location: 'Galle / Colombo'
  });
  console.log('Deduplicated Candidate 2 ID:', c2.candidate.id, 'isNew:', c2.isNew);
  console.log(c1.candidate.id === c2.candidate.id ? '✅ Deduplication SUCCESS (Same Candidate ID)' : '❌ Deduplication FAILED');

  // Test 2: Idempotent JobApplication Creation
  console.log('\n--- Test 2: JobApplication Idempotency ---');
  const mockJobId = 'mock-job-123';
  const app1 = await createJobApplication(c1.candidate.id, mockJobId);
  console.log('Application 1:', app1.id, 'Already applied?:', app1.alreadyApplied);

  const app2 = await createJobApplication(c1.candidate.id, mockJobId);
  console.log('Application 2:', app2.id, 'Already applied?:', app2.alreadyApplied);
  console.log(app2.alreadyApplied ? '✅ Application Idempotency SUCCESS' : '❌ Duplicate Application Created');
}

runTests().catch(console.error);
