// frontend/src/components/customer/CartSidebar.js - Version améliorée
import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Empty,
  Badge,
  Drawer,
  Space,
  Typography,
  Divider,
  Modal,
  Input,
  Alert,
  InputNumber,
  Tag,
  Tooltip,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { useOrders } from "../../hooks/useOrders";
import { formatCurrency } from "../../utils/formatters";
import * as orderService from "../../services/orderService";
import OrderSuccessModal from "./OrderSuccessModal";

const { Text, Title } = Typography;
const { TextArea } = Input;

const CartSidebar = ({ visible, onClose, tableSession }) => {
  const { cart } = useApp();
  const { placeOrder, loading: orderLoading } = useOrders();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [itemInstructions, setItemInstructions] = useState("");

  // Calculer les totaux
  const subtotal = cart.total;
  const taxRate = 0.18; // 18% de taxes
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleRemoveItem = (itemId) => {
    Modal.confirm({
      title: "Supprimer cet article ?",
      content: "Êtes-vous sûr de vouloir retirer cet article du panier ?",
      okText: "Supprimer",
      cancelText: "Annuler",
      onOk: () => cart.removeItem(itemId),
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      cart.updateQuantity(itemId, newQuantity);
    }
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

  const handleEditInstructions = (item) => {
    setEditingItem(item);
    setItemInstructions(item.special_instructions || "");
  };

  const handleSaveInstructions = () => {
    if (editingItem) {
      cart.updateItem(editingItem.id, {
        ...editingItem,
        special_instructions: itemInstructions,
      });
      setEditingItem(null);
      setItemInstructions("");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!tableSession?.tableId) {
        Modal.error({
          title: "Session requise",
          content: "Veuillez scanner le QR code de votre table pour commander.",
        });
        return;
      }

      if (cart.items.length === 0) {
        Modal.warning({
          title: "Panier vide",
          content: "Ajoutez des articles à votre panier avant de commander.",
        });
        return;
      }

      // Préparer les données de commande
      const orderData = orderService.prepareOrderData(
        cart.items,
        tableSession,
        specialInstructions
      );

      // Passer la commande
      const order = await placeOrder(orderData);

      // Succès
      cart.clearCart();
      setSuccessOrder(order);
      setOrderSuccess(true);
      onClose();
    } catch (error) {
      console.error("Erreur commande:", error);
      Modal.error({
        title: "Erreur",
        content:
          error.message ||
          "Impossible de passer la commande. Veuillez réessayer.",
      });
    }
  };

  // Contenu du panier
  const CartContent = () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* En-tête */}
      <div
        style={{ padding: "20px 24px 0", borderBottom: "1px solid #f0f0f0" }}
      >
        <Space justify="space-between" style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            <ShoppingCartOutlined /> Votre panier
          </Title>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </Space>

        {tableSession && (
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <Tag color="blue">Table {tableSession.tableNumber}</Tag>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: cart.items.length > 0 ? "16px 24px" : "0",
        }}
      >
        {cart.items.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Votre panier est vide"
              style={{ color: "#8c8c8c" }}
            >
              <Text type="secondary">
                Parcourez notre menu et ajoutez vos plats préférés !
              </Text>
            </Empty>
          </div>
        ) : (
          <>
            {/* Articles du panier */}
            <List
              dataSource={cart.items}
              renderItem={(item) => (
                <List.Item style={{ padding: "12px 0", border: "none" }}>
                  <Card
                    size="small"
                    style={{ width: "100%" }}
                    bodyStyle={{ padding: "12px 16px" }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Space justify="space-between" style={{ width: "100%" }}>
                        <Text strong>{item.name}</Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.id)}
                          danger
                        />
                      </Space>

                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {formatCurrency(item.price)} × {item.quantity}
                      </Text>
                    </div>

                    {/* Contrôles quantité */}
                    <Space justify="space-between" style={{ width: "100%" }}>
                      <Space>
                        <Button
                          size="small"
                          icon={<MinusOutlined />}
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                        />
                        <InputNumber
                          size="small"
                          min={1}
                          value={item.quantity}
                          onChange={(value) =>
                            handleUpdateQuantity(item.id, value)
                          }
                          style={{ width: 50 }}
                        />
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                        />
                      </Space>

                      <Text strong>
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </Space>

                    {/* Instructions spéciales */}
                    <div style={{ marginTop: 8 }}>
                      {item.special_instructions ? (
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Instructions: {item.special_instructions}
                          </Text>
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditInstructions(item)}
                            style={{ padding: 0, marginLeft: 8 }}
                          >
                            Modifier
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleEditInstructions(item)}
                          style={{ padding: 0, fontSize: "12px" }}
                        >
                          + Ajouter des instructions
                        </Button>
                      )}
                    </div>
                  </Card>
                </List.Item>
              )}
            />

            {/* Instructions générales */}
            <Card size="small" style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: "12px" }}>
                Instructions spéciales pour la commande
              </Text>
              <TextArea
                rows={2}
                placeholder="Allergies, préférences de cuisson, etc."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </Card>
          </>
        )}
      </div>

      {/* Footer avec totaux et commande */}
      {cart.items.length > 0 && (
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {/* Résumé des prix */}
            <div>
              <Space justify="space-between" style={{ width: "100%" }}>
                <Text>Sous-total:</Text>
                <Text>{formatCurrency(subtotal)}</Text>
              </Space>
              <Space justify="space-between" style={{ width: "100%" }}>
                <Text>TVA (18%):</Text>
                <Text>{formatCurrency(taxAmount)}</Text>
              </Space>
              <Divider style={{ margin: "8px 0" }} />
              <Space justify="space-between" style={{ width: "100%" }}>
                <Text strong style={{ fontSize: "16px" }}>
                  Total:
                </Text>
                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  {formatCurrency(total)}
                </Text>
              </Space>
            </div>

            {/* Boutons d'action */}
            <Space style={{ width: "100%" }}>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearCart}
                style={{ flex: 1 }}
              >
                Vider
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={orderLoading}
                onClick={handlePlaceOrder}
                style={{ flex: 2 }}
                size="large"
              >
                Commander
              </Button>
            </Space>
          </Space>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Drawer
        title={null}
        placement="right"
        width={400}
        open={visible}
        onClose={onClose}
        closable={false}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: "none" }}
      >
        <CartContent />
      </Drawer>

      {/* Modal de modification des instructions */}
      <Modal
        title="Instructions spéciales"
        open={!!editingItem}
        onOk={handleSaveInstructions}
        onCancel={() => {
          setEditingItem(null);
          setItemInstructions("");
        }}
        okText="Sauvegarder"
        cancelText="Annuler"
      >
        <TextArea
          rows={3}
          placeholder="Précisions pour ce plat (allergies, cuisson, etc.)"
          value={itemInstructions}
          onChange={(e) => setItemInstructions(e.target.value)}
        />
      </Modal>

      {/* Modal de succès */}
      {orderSuccess && (
        <OrderSuccessModal
          visible={orderSuccess}
          order={successOrder}
          onClose={() => {
            setOrderSuccess(false);
            setSuccessOrder(null);
          }}
        />
      )}
    </>
  );
};

export default CartSidebar;
