export function cache() {
  return {
    map: new Map(),
    get(key) {
      return this.map.get(key);
    },
    set(key, value) {
      if (this.map.size > 100) {
        const oldestKey = this.map.keys().next().value;
        this.map.delete(oldestKey);
      }
      return this.map.set(key, value);
    },
  };
}
