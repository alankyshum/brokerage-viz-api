import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import crypto from 'crypto';

export default class Cache {
  constructor(id, cacheType, ttl = 3600 * 24 * 1000) {
    this.id = id;
    this.cacheType = cacheType;
    this.ttl = ttl;
  }

  init() {
    const cachePath = resolve(`.cache/${this.cacheFileName}.json`);
    if (!existsSync(cachePath)) writeFileSync(cachePath, '');
    const adapter = new FileSync(cachePath);
    this.db = low(adapter);
    return this;
  }

  get cacheFileName() {
    const id = crypto.createHash('md5').update(this.id).digest('hex');
    return `${this.cacheType}_${id}`.replace(/\./g, '_');
  }

  save(key, data) {
    return this.db
      .set(Cache.encodeKey(key), {
        created: new Date(),
        data,
      })
      .write();
  }

  get(key) {
    const cachedData = this.db
      .get(Cache.encodeKey(key))
      .value();

    const expiredCache = cachedData && (new Date() - cachedData.created > this.ttl);
    if (expiredCache) this.db.unset(Cache.encodeKey(key)).write();
    if (!cachedData || expiredCache) return null;
    return cachedData.data;
  }

  static encodeKey(key) {
    return encodeURIComponent(key).replace(/\./g, '_');
  }
}
