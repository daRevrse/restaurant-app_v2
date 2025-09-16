class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time To Live
  }

  // Définir une valeur avec TTL optionnel (en millisecondes)
  set(key, value, ttlMs = 5 * 60 * 1000) {
    // 5 minutes par défaut
    this.cache.set(key, value);

    if (ttlMs > 0) {
      const expiresAt = Date.now() + ttlMs;
      this.ttl.set(key, expiresAt);

      // Auto-nettoyage
      setTimeout(() => {
        this.delete(key);
      }, ttlMs);
    }
  }

  // Récupérer une valeur
  get(key) {
    // Vérifier si la clé a expiré
    if (this.ttl.has(key)) {
      const expiresAt = this.ttl.get(key);
      if (Date.now() > expiresAt) {
        this.delete(key);
        return null;
      }
    }

    return this.cache.get(key) || null;
  }

  // Supprimer une clé
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  // Vider tout le cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Vérifier si une clé existe et n'a pas expiré
  has(key) {
    if (this.ttl.has(key)) {
      const expiresAt = this.ttl.get(key);
      if (Date.now() > expiresAt) {
        this.delete(key);
        return false;
      }
    }
    return this.cache.has(key);
  }

  // Obtenir toutes les clés valides
  keys() {
    const validKeys = [];
    for (const key of this.cache.keys()) {
      if (this.has(key)) {
        validKeys.push(key);
      }
    }
    return validKeys;
  }
}

// Instance singleton du cache
export const cacheService = new CacheService();
