const https = require('https');
const fs = require('fs');
const path = require('path');

function request(url, options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function testUpload() {
    const baseUrl = 'https://namita-suit-sorceroussyntaxs-projects.vercel.app';
    console.log(`Testing upload to ${baseUrl}...`);

    // 1. Login
    const loginData = JSON.stringify({ email: 'admin@namitasuitsansaar.com', password: 'Admin@123' });
    const loginRes = await request(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    }, loginData);

    console.log('Login status:', loginRes.statusCode);
    if (loginRes.statusCode !== 200) {
        console.error('Login failed:', loginRes.body);
        return;
    }

    const setCookie = loginRes.headers['set-cookie'];
    if (!setCookie) {
        console.error('No cookie received!');
        return;
    }
    const tokenCookie = setCookie.find(c => c.startsWith('token='));
    console.log('Got cookie:', tokenCookie ? 'Yes' : 'No');

    // 2. Create dummy image (1x1 PNG)
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

    // 3. Construct Multipart Body
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="images"; filename="test.png"\r\n';
    body += 'Content-Type: image/png\r\n\r\n';

    // Combine string body and buffer
    const headerPart = Buffer.from(body);
    const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([headerPart, imageBuffer, footerPart]);

    console.log('Uploading image...');
    const uploadRes = await request('https://namita-suit-sansaar.vercel.app/api/upload', {
        method: 'POST',
        headers: {
            'Cookie': tokenCookie,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': fullBody.length
        }
    }, fullBody);

    console.log('Upload status:', uploadRes.statusCode);
    console.log('Upload response:', uploadRes.body);
}

testUpload().catch(console.error);
