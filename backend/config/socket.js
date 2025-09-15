const jwt = require("jsonwebtoken");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> { socketId, role, tableId? }
    this.rooms = {
      KITCHEN: "kitchen",
      ADMIN: "admin",
      WAITERS: "waiters",
    };

    this.setupConnectionHandlers();
  }

  setupConnectionHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`🔌 New connection: ${socket.id}`);

      // Authentification du socket
      socket.on("authenticate", (token) => {
        this.authenticateSocket(socket, token);
      });

      // Rejoindre une table (pour les clients)
      socket.on("joinTable", (tableId) => {
        this.joinTable(socket, tableId);
      });

      // Déconnexion
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  authenticateSocket(socket, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userInfo = {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
        socketId: socket.id,
      };

      this.connectedUsers.set(decoded.id, userInfo);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      // Rejoindre les rooms selon le rôle
      this.joinRoleBasedRooms(socket, decoded.role);

      socket.emit("authenticated", { success: true, user: userInfo });
      console.log(
        `✅ User authenticated: ${decoded.username} (${decoded.role})`
      );
    } catch (error) {
      socket.emit("authenticated", { success: false, error: "Invalid token" });
      console.log(`❌ Authentication failed for socket ${socket.id}`);
    }
  }

  joinRoleBasedRooms(socket, role) {
    switch (role) {
      case "admin":
        socket.join(this.rooms.ADMIN);
        socket.join(this.rooms.KITCHEN);
        socket.join(this.rooms.WAITERS);
        break;
      case "waiter":
        socket.join(this.rooms.WAITERS);
        break;
      case "kitchen":
        socket.join(this.rooms.KITCHEN);
        break;
    }
  }

  joinTable(socket, tableId) {
    if (!socket.userId) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    const tableRoom = `table_${tableId}`;
    socket.join(tableRoom);
    socket.tableId = tableId;

    // Mettre à jour les infos utilisateur
    const userInfo = this.connectedUsers.get(socket.userId);
    if (userInfo) {
      userInfo.tableId = tableId;
      this.connectedUsers.set(socket.userId, userInfo);
    }

    socket.emit("tableJoined", { tableId, room: tableRoom });
    console.log(`👥 User ${socket.userId} joined table ${tableId}`);
  }

  handleDisconnect(socket) {
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
      console.log(`👋 User ${socket.userId} disconnected`);
    }
  }

  // Méthodes pour envoyer des notifications
  notifyNewOrder(order) {
    // Notifier la cuisine
    this.io.to(this.rooms.KITCHEN).emit("newOrder", {
      type: "NEW_ORDER",
      order: order,
      timestamp: new Date(),
    });

    // Notifier les admins
    this.io.to(this.rooms.ADMIN).emit("newOrder", {
      type: "NEW_ORDER_ADMIN",
      order: order,
      timestamp: new Date(),
    });

    // Notifier la table concernée
    if (order.tableId) {
      this.io.to(`table_${order.tableId}`).emit("orderCreated", {
        type: "ORDER_CONFIRMED",
        orderId: order.id,
        estimatedTime: order.estimatedTime,
        timestamp: new Date(),
      });
    }
  }

  notifyOrderStatusUpdate(order, previousStatus) {
    const statusMessages = {
      confirmed: "Votre commande a été confirmée",
      preparing: "Votre commande est en cours de préparation",
      ready: "Votre commande est prête !",
      served: "Bon appétit !",
      cancelled: "Votre commande a été annulée",
    };

    // Notifier la table
    if (order.tableId) {
      this.io.to(`table_${order.tableId}`).emit("orderStatusUpdate", {
        type: "STATUS_UPDATE",
        orderId: order.id,
        status: order.status,
        message: statusMessages[order.status],
        timestamp: new Date(),
      });
    }

    // Notifier les serveurs si la commande est prête
    if (order.status === "ready") {
      this.io.to(this.rooms.WAITERS).emit("orderReady", {
        type: "ORDER_READY",
        order: order,
        tableNumber: order.Table?.number,
        timestamp: new Date(),
      });
    }

    // Notifier les admins de tous les changements
    this.io.to(this.rooms.ADMIN).emit("orderStatusUpdate", {
      type: "ORDER_STATUS_ADMIN",
      order: order,
      previousStatus: previousStatus,
      timestamp: new Date(),
    });
  }

  notifyTableStatusUpdate(table) {
    // Notifier tous les serveurs
    this.io.to(this.rooms.WAITERS).emit("tableStatusUpdate", {
      type: "TABLE_STATUS_UPDATE",
      table: table,
      timestamp: new Date(),
    });

    // Notifier les admins
    this.io.to(this.rooms.ADMIN).emit("tableStatusUpdate", {
      type: "TABLE_STATUS_ADMIN",
      table: table,
      timestamp: new Date(),
    });
  }

  getConnectedUsersCount() {
    return {
      total: this.connectedUsers.size,
      byRole: {
        admin: Array.from(this.connectedUsers.values()).filter(
          (u) => u.role === "admin"
        ).length,
        waiter: Array.from(this.connectedUsers.values()).filter(
          (u) => u.role === "waiter"
        ).length,
        customer: Array.from(this.connectedUsers.values()).filter(
          (u) => u.role === "customer"
        ).length,
        kitchen: Array.from(this.connectedUsers.values()).filter(
          (u) => u.role === "kitchen"
        ).length,
      },
    };
  }
}

module.exports = SocketManager;
