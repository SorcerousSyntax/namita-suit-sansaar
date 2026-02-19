'use client';
import { useState, useEffect } from 'react';

export default function DebugPage() {
    const [envStatus, setEnvStatus] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/debug/env')
            .then(res => res.json())
            .then(setEnvStatus)
            .catch(err => setEnvStatus({ error: err.message }));
    }, []);

    async function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setUploadResult('Uploading...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });

            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                json = { raw: text };
            }

            setUploadResult({
                status: res.status,
                ok: res.ok,
                response: json
            });
        } catch (error) {
            setUploadResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: '20px', color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Debug Dashboard</h1>

            <section style={{ marginBottom: '40px', background: '#333', padding: '20px', borderRadius: '8px' }}>
                <h2>1. Server Environment Variables</h2>
                {envStatus ? (
                    <pre style={{ background: '#000', padding: '10px', overflow: 'auto' }}>
                        {JSON.stringify(envStatus, null, 2)}
                    </pre>
                ) : (
                    <p>Loading env status...</p>
                )}
                <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
                    If any of these are <code>false</code>, you must add them in Vercel Settings.
                </p>
            </section>

            <section style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
                <h2>2. Test Upload</h2>
                <input type="file" onChange={handleUpload} style={{ marginBottom: '20px' }} />

                {loading && <p>Uploading...</p>}

                {uploadResult && (
                    <div>
                        <h3>Result:</h3>
                        <pre style={{ background: '#000', padding: '10px', overflow: 'auto', border: uploadResult.ok ? '1px solid green' : '1px solid red' }}>
                            {JSON.stringify(uploadResult, null, 2)}
                        </pre>
                    </div>
                )}
            </section>
        </div>
    );
}
