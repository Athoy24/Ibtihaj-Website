import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

// Local file fallback for development testing when Vercel KV is not configured
const LOCAL_KV_PATH = path.join(process.cwd(), '.data', 'local_kv.json');

function ensureLocalKV() {
    if (!fs.existsSync(path.dirname(LOCAL_KV_PATH))) {
        fs.mkdirSync(path.dirname(LOCAL_KV_PATH), { recursive: true });
    }
    if (!fs.existsSync(LOCAL_KV_PATH)) {
        fs.writeFileSync(LOCAL_KV_PATH, JSON.stringify({}));
    }
}

function readLocalKV() {
    ensureLocalKV();
    return JSON.parse(fs.readFileSync(LOCAL_KV_PATH, 'utf-8'));
}

function writeLocalKV(data) {
    fs.writeFileSync(LOCAL_KV_PATH, JSON.stringify(data, null, 2));
}

export async function kvSetNX(key, value, ttlSeconds = 86400) {
    if (process.env.KV_REST_API_URL) {
        // Atomic create-if-absent in Vercel KV
        const result = await kv.set(key, value, { nx: true, ex: ttlSeconds });
        return result === 'OK';
    } else {
        // Fallback local implementation
        const data = readLocalKV();
        // Check TTL expiration
        if (data[key] && data[key].expiresAt < Date.now()) {
            delete data[key];
        }
        if (data[key]) {
            return false; // Already exists
        }
        data[key] = {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        };
        writeLocalKV(data);
        return true;
    }
}

export async function kvGet(key) {
    if (process.env.KV_REST_API_URL) {
        return await kv.get(key);
    } else {
        const data = readLocalKV();
        if (data[key] && data[key].expiresAt > Date.now()) {
            return data[key].value;
        }
        return null;
    }
}

export async function kvSet(key, value, ttlSeconds = 86400) {
    if (process.env.KV_REST_API_URL) {
        await kv.set(key, value, { ex: ttlSeconds });
    } else {
        const data = readLocalKV();
        data[key] = {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        };
        writeLocalKV(data);
    }
}

export async function kvIncr(key) {
    if (process.env.KV_REST_API_URL) {
        return await kv.incr(key);
    } else {
        const data = readLocalKV();
        if (data[key] && data[key].expiresAt < Date.now()) {
            delete data[key];
        }
        let val = 1;
        if (data[key]) {
            val = Number(data[key].value) + 1;
        }
        data[key] = {
            value: val,
            expiresAt: data[key]?.expiresAt || (Date.now() + 86400000)
        };
        writeLocalKV(data);
        return val;
    }
}

export async function kvExpire(key, ttlSeconds) {
    if (process.env.KV_REST_API_URL) {
        return await kv.expire(key, ttlSeconds);
    } else {
        const data = readLocalKV();
        if (data[key]) {
            data[key].expiresAt = Date.now() + ttlSeconds * 1000;
            writeLocalKV(data);
            return 1;
        }
        return 0;
    }
}
