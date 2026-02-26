// A simple utility for rate-limited API calls
export async function rateLimitedFetch(
    url: string,
    delayMs = 1000
): Promise<Response> {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await fetch(url);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        }, delayMs);
    });
}

// Queue for processing geocoding requests sequentially with rate limiting
export class GeocodingQueue {
    private queue: {
        place: string;
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    }[] = [];
    private processing = false;
    private delayMs: number;

    constructor(delayMs = 1000) {
        this.delayMs = delayMs;
    }

    async add(place: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({ place, resolve, reject });
            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    private async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const { place, resolve, reject } = this.queue.shift()!;

        try {
            const response = await rateLimitedFetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,
                this.delayMs
            );

            const data = await response.json();

            let lat, lng;
            if (data.length > 0) {
                lat = data[0].lat;
                lng = data[0].lon;
                resolve({
                    lat: Number.parseFloat(lat),
                    lng: Number.parseFloat(lng),
                });
            } else {
                lat = 14.7011; // Default latitude
                lng = 120.983; // Default longitude
                resolve({ lat, lng }); // Default coordinates
            }
        } catch (error) {
            reject(error);
        }

        // Process next item in queue
        this.processQueue();
    }
}
