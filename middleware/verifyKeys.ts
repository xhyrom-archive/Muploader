import LRU from 'lru-cache';

export class VerifyKeyManager {
    cache;
    constructor() {
        this.cache = new LRU({
            maxAge: 18000000 
        });
    }

    setCaptcha(options) {
        this.cache.set(options.key, options.type);
    }

    getCaptcha(key) {
        return this.cache.get(key);
    }

    deleteCaptcha(key) {
        return this.cache.del(key);
    }
}

global.VerifyKey = global.VerifyKey || new VerifyKeyManager();
export const VerifyKey = global.VerifyKey;