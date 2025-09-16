import React, { useState } from "react";
import {
  Row,
  Col,
  Image,
  Button,
  InputNumber,
  Input,
  Space,
  Tag,
  Divider,
  Rate,
  Typography,
} from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { formatCurrency } from "../../utils/formatters";

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const DishModal = ({ dish, onClose }) => {
  const { cart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleAddToCart = () => {
    cart.addItem(dish, quantity, specialInstructions);
    onClose();
  };

  const handleQuantityChange = (value) => {
    setQuantity(Math.max(1, value || 1));
  };

  const totalPrice = dish.price * quantity;

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Image du plat */}
        <Col xs={24} md={10}>
          <Image
            src={
              dish.image_url
                ? `${process.env.REACT_APP_API_URL}${dish.image_url}`
                : "/images/placeholder-dish.jpg"
            }
            alt={dish.name}
            style={{ width: "100%", borderRadius: 8 }}
          />
        </Col>

        {/* Détails du plat */}
        <Col xs={24} md={14}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Prix et temps de préparation */}
            <div>
              <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                {formatCurrency(dish.price)}
              </Title>
              {dish.preparation_time && (
                <Text type="secondary">
                  Temps de préparation: {dish.preparation_time} minutes
                </Text>
              )}
            </div>

            {/* Description */}
            {dish.description && <Paragraph>{dish.description}</Paragraph>}

            {/* Tags nutritionnels */}
            <Space wrap>
              {dish.is_vegetarian && <Tag color="green">🌱 Végétarien</Tag>}
              {dish.is_vegan && <Tag color="green">🌿 Vegan</Tag>}
              {dish.is_gluten_free && <Tag color="orange">Sans gluten</Tag>}
              {dish.calories && <Tag color="blue">{dish.calories} cal</Tag>}
            </Space>

            {/* Ingrédients */}
            {dish.ingredients && dish.ingredients.length > 0 && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <div>
                  <Text strong>Ingrédients:</Text>
                  <br />
                  <Text type="secondary">{dish.ingredients.join(", ")}</Text>
                </div>
              </>
            )}

            {/* Allergènes */}
            {dish.allergens && dish.allergens.length > 0 && (
              <div>
                <Text strong style={{ color: "#ff4d4f" }}>
                  Allergènes:
                </Text>
                <br />
                <Text type="secondary">{dish.allergens.join(", ")}</Text>
              </div>
            )}

            <Divider style={{ margin: "12px 0" }} />

            {/* Contrôles de quantité */}
            <div>
              <Text strong>Quantité:</Text>
              <br />
              <Space style={{ marginTop: 8 }}>
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                />
                <InputNumber
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={handleQuantityChange}
                  style={{ width: 60 }}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleQuantityChange(quantity + 1)}
                />
              </Space>
            </div>

            {/* Instructions spéciales */}
            <div>
              <Text strong>Instructions spéciales (optionnel):</Text>
              <TextArea
                placeholder="Ex: Sans oignons, bien cuit, épicé..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                maxLength={200}
                showCount
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginTop: 8 }}
              />
            </div>

            {/* Prix total et bouton d'ajout */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
                padding: "16px 0",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div>
                <Text strong style={{ fontSize: 18 }}>
                  Total: {formatCurrency(totalPrice)}
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={!dish.is_available}
              >
                Ajouter au panier
              </Button>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default DishModal;
