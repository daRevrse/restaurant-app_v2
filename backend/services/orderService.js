const {
    Order,
    OrderItem,
    Dish,
    Table,
    TableSession,
    User,
  } = require("../models");
  const { Op } = require("sequelize");
  
  class OrderService {
    constructor(socketManager) {
      this.socketManager = socketManager;
    }
  
    async createOrder(orderData) {
      const { table_id, session_id, items, special_instructions, waiter_id } =
        orderData;
  
      try {
        // Vérifier la session et la table
        const session = await TableSession.findByPk(session_id, {
          include: [{ model: Table, as: "table" }],
        });
  
        if (!session || session.status !== "active") {
          throw new Error("Session invalide ou inactive");
        }
  
        // Calculer les montants et temps de préparation
        let subtotal = 0;
        let estimatedTime = 0;
        const orderItemsData = [];
  
        for (const item of items) {
          const dish = await Dish.findByPk(item.dish_id);
          if (!dish || !dish.is_available) {
            throw new Error(`Plat ${item.dish_id} non disponible`);
          }
  
          const itemTotal = parseFloat(dish.price) * item.quantity;
          subtotal += itemTotal;
          estimatedTime = Math.max(estimatedTime, dish.preparation_time);
  
          orderItemsData.push({
            dish_id: item.dish_id,
            quantity: item.quantity,
            unit_price: dish.price,
            total_price: itemTotal,
            special_instructions: item.special_instructions || null,
          });
        }
  
        // Calcul des taxes (exemple: 18%)
        const taxRate = 0.18;
        const taxAmount = subtotal * taxRate;
        const totalAmount = subtotal + taxAmount;
  
        // Créer la commande
        const order = await Order.create({
          table_id,
          session_id,
          waiter_id,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          estimated_time: estimatedTime,
          special_instructions,
          status: "pending",
        });
  
        // Créer les items de commande
        const createdItems = await Promise.all(
          orderItemsData.map((itemData) =>
            OrderItem.create({ ...itemData, order_id: order.id })
          )
        );
  
        // Recharger la commande avec toutes les relations
        const completeOrder = await this.getOrderById(order.id);
  
        // Confirmer automatiquement la commande
        await this.updateOrderStatus(order.id, "confirmed");
  
        // Notification temps réel
        if (this.socketManager) {
          this.socketManager.notifyNewOrder(completeOrder);
        }
  
        return completeOrder;
      } catch (error) {
        console.error("Erreur création commande:", error);
        throw error;
      }
    }
  
    async getOrderById(orderId) {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Table,
            as: "table",
            attributes: ["id", "number", "capacity"],
          },
          {
            model: TableSession,
            as: "session",
            attributes: ["id", "customer_name", "guest_count"],
          },
          {
            model: User,
            as: "waiter",
            attributes: ["id", "username"],
          },
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Dish,
                as: "dish",
                attributes: ["id", "name", "description", "image_url"],
              },
            ],
          },
        ],
      });
  
      if (!order) {
        throw new Error("Commande non trouvée");
      }
  
      return order;
    }
  
    async updateOrderStatus(orderId, newStatus, updatedBy = null) {
      const validTransitions = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["preparing", "cancelled"],
        preparing: ["ready", "cancelled"],
        ready: ["served"],
        served: ["completed"],
        cancelled: [],
        completed: [],
      };
  
      const order = await this.getOrderById(orderId);
      const currentStatus = order.status;
  
      // Vérifier si la transition est valide
      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        throw new Error(`Transition invalide: ${currentStatus} -> ${newStatus}`);
      }
  
      // Mise à jour des timestamps selon le statut
      const updateData = { status: newStatus };
  
      switch (newStatus) {
        case "confirmed":
          updateData.confirmed_at = new Date();
          break;
        case "ready":
          updateData.ready_at = new Date();
          break;
        case "served":
          updateData.served_at = new Date();
          if (updatedBy) updateData.waiter_id = updatedBy;
          break;
      }
  
      await Order.update(updateData, { where: { id: orderId } });
  
      // Recharger la commande mise à jour
      const updatedOrder = await this.getOrderById(orderId);
  
      // Notification temps réel
      if (this.socketManager) {
        this.socketManager.notifyOrderStatusUpdate(updatedOrder, currentStatus);
      }
  
      return updatedOrder;
    }
  
    async getOrdersByTable(tableId, status = null) {
      const whereClause = { table_id: tableId };
      if (status) whereClause.status = status;
  
      return await Order.findAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Dish, as: "dish" }],
          },
        ],
        order: [["ordered_at", "DESC"]],
      });
    }
  
    async getOrdersByStatus(status) {
      return await Order.findAll({
        where: { status },
        include: [
          { model: Table, as: "table" },
          { model: TableSession, as: "session" },
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Dish, as: "dish" }],
          },
        ],
        order: [["ordered_at", "ASC"]],
      });
    }
  
    async getDashboardStats() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const [
        totalOrdersToday,
        pendingOrders,
        preparingOrders,
        readyOrders,
        todayRevenue,
      ] = await Promise.all([
        Order.count({
          where: {
            ordered_at: { [Op.gte]: today },
          },
        }),
        Order.count({ where: { status: "pending" } }),
        Order.count({ where: { status: "preparing" } }),
        Order.count({ where: { status: "ready" } }),
        Order.sum("total_amount", {
          where: {
            ordered_at: { [Op.gte]: today },
            status: { [Op.in]: ["completed", "served"] },
          },
        }),
      ]);
  
      return {
        totalOrdersToday,
        pendingOrders,
        preparingOrders,
        readyOrders,
        todayRevenue: todayRevenue || 0,
      };
    }
  }
  
  module.exports = OrderService;