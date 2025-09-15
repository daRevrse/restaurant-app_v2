const crypto = require("crypto");
const QRCode = require("qrcode");

class Helpers {
  // Générer un ID unique
  static generateUniqueId(prefix = "") {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString("hex");
    return `${prefix}${timestamp}${random}`.toUpperCase();
  }

  // Générer un QR Code
  static async generateQRCode(data, options = {}) {
    const defaultOptions = {
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    };

    const qrOptions = { ...defaultOptions, ...options };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(
        JSON.stringify(data),
        qrOptions
      );
      return qrCodeDataURL;
    } catch (error) {
      console.error("Erreur génération QR Code:", error);
      throw new Error("Impossible de générer le QR Code");
    }
  }

  // Calculer le temps estimé de préparation pour une commande
  static calculateEstimatedTime(orderItems) {
    if (!orderItems || orderItems.length === 0) return 15;

    // Le temps max parmi tous les plats + 5 minutes par plat supplémentaire
    const maxTime = Math.max(
      ...orderItems.map((item) => item.dish?.preparation_time || 15)
    );
    const additionalTime = Math.max(0, (orderItems.length - 1) * 5);

    return Math.min(maxTime + additionalTime, 60); // Max 60 minutes
  }

  // Formater un montant en devise locale
  static formatCurrency(amount, currency = "XOF") {
    const formatter = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    });

    return formatter.format(amount);
  }

  // Générer un numéro de commande unique
  static generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `ORD${year}${month}${day}${hour}${minute}${random}`;
  }

  // Valider un numéro de téléphone
  static validatePhoneNumber(phone) {
    // Format international ou local
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{8,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  // Nettoyer et valider les données d'entrée
  static sanitizeInput(input, type = "string") {
    if (input === null || input === undefined) return null;

    switch (type) {
      case "string":
        return input.toString().trim();
      case "number":
        const num = parseFloat(input);
        return isNaN(num) ? null : num;
      case "boolean":
        return Boolean(input);
      case "array":
        return Array.isArray(input) ? input : [];
      default:
        return input;
    }
  }

  // Générer un slug à partir d'un texte
  static generateSlug(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^a-z0-9 -]/g, "") // Garder seulement lettres, chiffres, espaces et tirets
      .replace(/\s+/g, "-") // Remplacer espaces par tirets
      .replace(/-+/g, "-") // Supprimer tirets multiples
      .trim("-"); // Supprimer tirets en début/fin
  }

  // Calculer la distance entre deux points (en km)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Pagination helper
  static getPaginationData(page, limit, total) {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (currentPage - 1) * pageSize;
    const totalPages = Math.ceil(total / pageSize);

    return {
      currentPage,
      pageSize,
      offset,
      totalPages,
      total,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }
}

module.exports = Helpers;
