// backend/scripts/monitor.js
const { sequelize } = require("../models");
const redis = require("../config/redis");

class SystemMonitor {
  constructor() {
    this.startTime = Date.now();
  }

  async checkDatabase() {
    try {
      await sequelize.authenticate();
      return { status: "OK", message: "Base de données connectée" };
    } catch (error) {
      return { status: "ERROR", message: error.message };
    }
  }

  async checkRedis() {
    try {
      if (!redis.isOpen) {
        await redis.connect();
      }
      await redis.ping();
      return { status: "OK", message: "Redis connecté" };
    } catch (error) {
      return { status: "ERROR", message: error.message };
    }
  }

  getSystemInfo() {
    const uptime = Date.now() - this.startTime;
    const memory = process.memoryUsage();
    
    return {
      uptime: Math.floor(uptime / 1000), // en secondes
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024), // MB
        total: Math.round(memory.heapTotal / 1024 / 1024), // MB
        external: Math.round(memory.external / 1024 / 1024), // MB
      },
      nodeVersion: process.version,
      pid: process.pid,
    };
  }

  async getHealthCheck() {
    const [dbCheck, redisCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      status: dbCheck.status === "OK" && redisCheck.status === "OK" ? "HEALTHY" : "UNHEALTHY",
      services: {
        database: dbCheck,
        redis: redisCheck,
      },
      system: this.getSystemInfo(),
    };
  }

  async displayStatus() {
    console.clear();
    console.log("🏥 Restaurant Backend - Monitor");
    console.log("================================");
    
    const health = await this.getHealthCheck();
    
    // Status général
    const statusIcon = health.status === "HEALTHY" ? "✅" : "❌";
    console.log(`${statusIcon} Status: ${health.status}`);
    console.log(`⏰ Timestamp: ${health.timestamp}`);
    console.log("");

    // Services
    console.log("📊 Services:");
    Object.entries(health.services).forEach(([name, service]) => {
      const icon = service.status === "OK" ? "✅" : "❌";
      console.log(`  ${icon} ${name}: ${service.message}`);
    });
    console.log("");

    // Système
    console.log("💻 Système:");
    console.log(`  🕐 Uptime: ${health.system.uptime}s`);
    console.log(`  🧠 Mémoire: ${health.system.memory.used}MB / ${health.system.memory.total}MB`);
    console.log(`  🟢 Node.js: ${health.system.nodeVersion}`);
    console.log(`  🆔 PID: ${health.system.pid}`);
    console.log("");

    console.log("Press Ctrl+C to exit");
  }

  start() {
    console.log("🚀 Démarrage du monitoring...");
    
    // Affichage initial
    this.displayStatus();
    
    // Mise à jour toutes les 5 secondes
    this.interval = setInterval(() => {
      this.displayStatus();
    }, 5000);

    // Gestion propre de l'arrêt
    process.on("SIGINT", () => {
      console.log("\n👋 Arrêt du monitoring...");
      if (this.interval) {
        clearInterval(this.interval);
      }
      process.exit(0);
    });
  }
}

// Démarrer le monitoring si exécuté directement
if (require.main === module) {
  const monitor = new SystemMonitor();
  monitor.start();
}

module.exports = SystemMonitor;