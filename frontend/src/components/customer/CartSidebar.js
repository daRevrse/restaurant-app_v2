import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Empty,
  Badge,
  Drawer,
  FloatButton,
  Space,
  Typography,
  Divider,
  Modal,
  Result,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { useOrders } from "../../hooks/useOrders";
import { useResponsive } from "../../hooks/useResponsive";
import { formatCurrency } from "../../utils/formatters";
import * as orderService from "../../services/orderService";
import OrderSuccessModal from "./OrderSuccessModal";

const { Text, Title } = Typography;

const CartSidebar = () => {
  const { cart } = useApp();
  const { placeOrder, loading: orderLoading } = useOrders();
  const { isMobile } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Calculer les totaux
  const subtotal = cart.total;
  const taxRate = 0.18; // 18% de taxes
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleRemoveItem = (itemId) => {
    cart.removeItem(itemId);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    cart.updateQuantity(itemId, newQuantity);
  };

  const handleClearCart = () => {
    Modal.confirm({
      title: "Vider le panier ?",
      content: "Êtes-vous sûr de vouloir supprimer tous les articles ?",
      okText: "Oui, vider",
      cancelText: "Annuler",
      onOk: cart.clearCart,
    });
  };

  const handlePlaceOrder = async () => {
    try {
      // Récupérer la session de table depuis localStorage
      const tableSession = JSON.parse(
        localStorage.getItem("tableSession") || "{}"
      );

      if (!tableSession.tableId) {
        Modal.error({
          title: "Session requise",
          content: "Veuillez scanner le QR code de votre table pour commander.",
        });
        return;
      }

      // Préparer les données de commande
      const orderData = orderService.prepareOrderData(cart.items, tableSession);

      // Passer la commande
      const order = await placeOrder(orderData);

      // Vider le panier et afficher le succès
      cart.clearCart();
      setSuccessOrder(order);
      setOrderSuccess(true);
      setDrawerVisible(false);
    } catch (error) {
      console.error("Erreur commande:", error);
      Modal.error({
        title: "Erreur",
        content: "Impossible de passer la commande. Veuillez réessayer.",
      });
    }
  };

  // Contenu du panier
  const CartContent = () => (
    <div>
      {cart.items.length === 0 ? (
        <Empty
          description="Votre panier est vide"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          {/* Liste des articles */}
          <List
            dataSource={cart.items}
            renderItem={(item) => (
              <List.Item
                style={{ padding: "12px 0" }}
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(item.id)}
                    size="small"
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={
                        item.image_url
                          ? `${process.env.REACT_APP_API_URL}${item.image_url}`
                          : "/images/placeholder-dish.jpg"
                      }
                      alt={item.name}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  }
                  title={
                    <div>
                      <Text strong>{item.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatCurrency(item.price)} × {item.quantity}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      {item.special_instructions && (
                        <Text style={{ fontSize: 11, color: "#666" }}>
                          Note: {item.special_instructions}
                        </Text>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          />
                          <span>{item.quantity}</span>
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                          />
                        </Space>
                        <Text strong style={{ float: "right" }}>
                          {formatCurrency(item.price * item.quantity)}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />

          <Divider />

          {/* Récapitulatif des prix */}
          <div style={{ padding: "0 16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text>Sous-total:</Text>
              <Text>{formatCurrency(subtotal)}</Text>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text>Taxes (18%):</Text>
              <Text>{formatCurrency(taxAmount)}</Text>
            </div>
            <Divider style={{ margin: "12px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                Total:
              </Text>
              <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                {formatCurrency(total)}
              </Text>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: "0 16px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                size="large"
                block
                loading={orderLoading}
                onClick={handlePlaceOrder}
                style={{ marginBottom: 8 }}
              >
                Commander ({formatCurrency(total)})
              </Button>
              <Button
                type="text"
                danger
                icon={<ClearOutlined />}
                onClick={handleClearCart}
                block
              >
                Vider le panier
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );

  // Version mobile : FloatButton + Drawer
  if (isMobile) {
    return (
      <>
        <Badge count={cart.itemCount} size="small">
          <FloatButton
            icon={<ShoppingCartOutlined />}
            type="primary"
            onClick={() => setDrawerVisible(true)}
            style={{ right: 24, bottom: 24 }}
          />
        </Badge>

        <Drawer
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Panier ({cart.itemCount} articles)</span>
              {cart.items.length > 0 && (
                <Text type="secondary">{formatCurrency(total)}</Text>
              )}
            </div>
          }
          placement="right"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width="90%"
        >
          <CartContent />
        </Drawer>

        <OrderSuccessModal
          visible={orderSuccess}
          order={successOrder}
          onClose={() => setOrderSuccess(false)}
        />
      </>
    );
  }

  // Version desktop : Card fixe
  return (
    <>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Panier ({cart.itemCount})</span>
            {cart.items.length > 0 && (
              <Text type="secondary">{formatCurrency(total)}</Text>
            )}
          </div>
        }
        size="small"
        style={{
          position: "sticky",
          top: 20,
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
        }}
      >
        <CartContent />
      </Card>

      <OrderSuccessModal
        visible={orderSuccess}
        order={successOrder}
        onClose={() => setOrderSuccess(false)}
      />
    </>
  );
};

export default CartSidebar;
