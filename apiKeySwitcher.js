// apiKeySwitcher.js
class ApiKeySwitcher {
    constructor(keys) {
        this.keys = keys || [];
        this.currentIndex = 0;
    }

    // Get the current API key
    getCurrentKey() {
        if (this.keys.length === 0) {
            throw new Error('هیچ کلید API در دسترس نیست.');
        }
        return this.keys[this.currentIndex];
    }

    // Switch to the next API key
    switchToNextKey() {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        console.log(`تعویض به کلید API جدید: ${this.getCurrentKey()}`);
    }

    // Fetch with automatic key switching
    async fetchWithKeySwitch(urlTemplate, maxRetries = null) {
        const retries = maxRetries !== null ? maxRetries : this.keys.length;
        let attempts = 0;

        while (attempts < retries) {
            const url = urlTemplate(this.getCurrentKey());
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status === 429) {
                        console.warn('محدودیت نرخ OMDB API - تعویض کلید...');
                        this.switchToNextKey();
                        attempts++;
                        continue;
                    }
                    throw new Error(`خطای سرور (OMDB): ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.warn(`خطا در درخواست با کلید ${this.getCurrentKey()}: ${error.message}`);
                this.switchToNextKey();
                attempts++;
                if (attempts >= retries) {
                    throw new Error('تمام کلیدهای API امتحان شدند و خطا ادامه دارد.');
                }
            }
        }
    }
}

// Load API keys from JSON file
async function loadApiKeys() {
    try {
        const response = await fetch('/path/to/omdbKeys.json'); // Adjust this path to the actual location of omdbKeys.json
        if (!response.ok) {
            throw new Error(`خطا در بارگذاری فایل JSON: ${response.status}`);
        }
        const keys = await response.json();
        return new ApiKeySwitcher(keys);
    } catch (error) {
        console.error('خطا در بارگذاری کلیدهای API:', error);
        return new ApiKeySwitcher(['38fa39d5']); // Fallback to default key
    }
}

export { loadApiKeys };