// lib/api.ts
type HazardApiPayload = Record<string, unknown>;

function extractHazardPayload(payload: HazardApiPayload) {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const nested = payload.data;
        if (nested && typeof nested === 'object') {
            return nested;
        }
    }

    return payload;
}

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function fetchToken(): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch('https://api.georisk.gov.ph/generate/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.HAZARDHUNTER_CLIENT_ID,
                client_secret: process.env.HAZARDHUNTER_CLIENT_SECRET,
            }),
            signal: controller.signal,
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
                `Token request failed with status ${res.status}: ${errorText}`
            );
        }

        const data = await res.json();

        cachedToken = data.token || data.access_token;

        if (!cachedToken) {
            throw new Error('Token response did not include a token.');
        }

        tokenExpiry = Date.now() + 1000 * 60 * 50;
        return cachedToken;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(
                'HazardHunter token request timed out. The GeoRisk API may be unavailable or too slow right now.'
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const res = await fetch('https://api.georisk.gov.ph/api/assessments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: payload,
            signal: controller.signal,
        });

        if (res.status === 401) {
            const newToken = await fetchToken();

            const retryController = new AbortController();
            const retryTimeout = setTimeout(
                () => retryController.abort(),
                15000
            );

            try {
                const retryRes = await fetch(
                    'https://api.georisk.gov.ph/api/assessments',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: payload,
                        signal: retryController.signal,
                    }
                );

                if (!retryRes.ok) {
                    const retryErrorText = await retryRes.text();
                    throw new Error(
                        `Retry failed with status ${retryRes.status}: ${retryErrorText}`
                    );
                }

                const retryJson = await retryRes.json();
                return extractHazardPayload(retryJson);
            } finally {
                clearTimeout(retryTimeout);
            }
        }

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
                `Assessment failed with status ${res.status}: ${errorText}`
            );
        }

        const json = await res.json();
        return extractHazardPayload(json);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(
                'Hazard assessment request timed out. The GeoRisk API may be unavailable or too slow right now.'
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}
