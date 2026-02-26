// lib/api.ts
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function fetchToken(): Promise<string> {
    const res = await fetch('https://api.georisk.gov.ph/generate/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: process.env.HAZARDHUNTER_CLIENT_ID,
            client_secret: process.env.HAZARDHUNTER_CLIENT_SECRET,
        }),
    });

    if (!res.ok) {
        throw new Error(`Token request failed with status ${res.status}`);
    }

    const data = await res.json();
    cachedToken = data.token || data.access_token;
    tokenExpiry = Date.now() + 1000 * 60 * 50; // 50 minutes token lifespan
    return cachedToken!;
}

async function getValidToken(): Promise<string> {
    if (!cachedToken || !tokenExpiry || Date.now() > tokenExpiry) {
        return await fetchToken();
    }
    return cachedToken;
}

export async function fetchHazardAssessment(
    latitude: number,
    longitude: number
) {
    const token = await getValidToken();

    const payload = JSON.stringify({ latitude, longitude });

    const res = await fetch('https://api.georisk.gov.ph/api/assessments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: payload,
    });

    if (res.status === 401) {
        const newToken = await fetchToken();
        const retryRes = await fetch(
            'https://api.georisk.gov.ph/api/assessments',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${newToken}`,
                },
                body: payload,
            }
        );

        if (!retryRes.ok) {
            throw new Error(`Retry failed with status ${retryRes.status}`);
        }

        return await retryRes.json();
    }

    if (!res.ok) {
        throw new Error(`Assessment failed with status ${res.status}`);
    }

    return await res.json();
}
