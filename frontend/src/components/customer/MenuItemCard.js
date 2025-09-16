import React, { useState } from "react";
import { Card, Button, Badge, Tag, Space, Image } from "antd";
import { PlusOutlined, LeafIcon, HeartIcon } from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { formatCurrency } from "../../utils/formatters";

const { Meta } = Card;

const MenuItemCard = ({ dish, onClick, size = "default" }) => {
  const { cart } = useApp();
  const [imageError, setImageError] = useState(false);

  const handleQuickAdd = (e) => {
    e.stopPropagation(); // Empêcher l'ouverture du modal
    cart.addItem(dish, 1);
  };

  const getImageUrl = () => {
    if (imageError || !dish.image_url) {
      return "/images/placeholder-dish.jpg";
    }
    return `${process.env.REACT_APP_API_URL}${dish.image_url}`;
  };

  const cardSize = size === "small" ? "small" : "default";

  return (
    <Badge.Ribbon
      text={!dish.is_available ? "Indisponible" : null}
      color="red"
      style={{ display: !dish.is_available ? "block" : "none" }}
    >
      <Card
        hoverable={dish.is_available}
        size={cardSize}
        onClick={dish.is_available ? onClick : undefined}
        cover={
          <div
            style={{
              height: size === "small" ? 120 : 160,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              src={getImageUrl()}
              alt={dish.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={() => setImageError(true)}
              preview={false}
            />
            {!dish.is_available && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: size === "small" ? 12 : 14,
                }}
              >
                Non disponible
              </div>
            )}
          </div>
        }
        actions={
          dish.is_available
            ? [
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleQuickAdd}
                  size={size === "small" ? "small" : "default"}
                >
                  Ajouter
                </Button>,
              ]
            : []
        }
        style={{
          opacity: dish.is_available ? 1 : 0.7,
          height: "100%",
        }}
      >
        <Meta
          title={
            <div>
              <div
                style={{
                  fontSize: size === "small" ? 14 : 16,
                  marginBottom: 4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {dish.name}
              </div>
              <div
                style={{
                  fontSize: size === "small" ? 16 : 18,
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {formatCurrency(dish.price)}
              </div>
            </div>
          }
          description={
            <div>
              <p
                style={{
                  margin: "8px 0",
                  fontSize: size === "small" ? 12 : 13,
                  color: "#666",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {dish.description}
              </p>

              <Space wrap size={4}>
                {dish.preparation_time && (
                  <Tag size="small" color="blue">
                    {dish.preparation_time} min
                  </Tag>
                )}
                {dish.is_vegetarian && (
                  <Tag size="small" color="green">
                    🌱 Végétarien
                  </Tag>
                )}
                {dish.is_vegan && (
                  <Tag size="small" color="green">
                    🌿 Vegan
                  </Tag>
                )}
                {dish.is_gluten_free && (
                  <Tag size="small" color="orange">
                    Sans gluten
                  </Tag>
                )}
              </Space>
            </div>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

export default MenuItemCard;
