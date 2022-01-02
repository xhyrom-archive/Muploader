import LRU from 'lru-cache';

export class VerifyKeyManager {
    cache;
    constructor() {
        this.cache = new LRU({
            maxAge: 18000000 
        });
    }

    setCaptcha(options) {
        return this.cache.set(options.key, options.type);
    }

    getCaptcha(options) {
        const value = this.cache.get(options.key);
        this.cache.del(options.key);

        return value;
    }

    ok() {
        return true;
    }
}

export const VerifyKey = new VerifyKeyManager();