const https = require('https');
const fs = require('fs');

const BOUNDARY = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

function testUpload(hostname) {
    return new Promise((resolve, reject) => {
        console.log(`\nTesting ${hostname}...`);

        const bodyStart = `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`;
        const bodyEnd = `\r\n--${BOUNDARY}--\r\n`;

        // 1x1 PNG pixel
        const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==', 'base64');

        const fullBody = Buffer.concat([
            Buffer.from(bodyStart),
            imageBuffer,
            Buffer.from(bodyEnd)
        ]);

        const req = https.request({
            hostname: hostname,
            path: '/api/upload',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${BOUNDARY}`,
                'Content-Length': fullBody.length
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data}`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Error: ${e.message}`);
            resolve();
        });

        req.write(fullBody);
        req.end();
    });
}

(async () => {
    // Test BOTH potential URLs
    await testUpload('namita-suit.vercel.app');
    await testUpload('namita-suit-sansaar.vercel.app');
})();
