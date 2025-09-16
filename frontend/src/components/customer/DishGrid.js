import React from "react";
import { Row, Col, Card, Button, Typography, Tag, Empty } from "antd";
import { ShoppingCartOutlined, StarOutlined } from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { formatPrice } from "../../utils/errorHandler";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

const DishGrid = ({ dishes }) => {
  const { cart } = useApp();

  const handleAddToCart = (dish) => {
    cart.addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image_url,
      quantity: 1,
    });
  };

  if (!dishes.length) {
    return (
      <Card>
        <Empty
          description="Aucun plat trouvé"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {dishes.map((dish) => (
        <Col key={dish.id} xs={24} sm={12} lg={8} xl={6}>
          <Card
            hoverable
            cover={
              <img
                alt={dish.name}
                src={dish.image_url || "/images/placeholder-dish.jpg"}
                style={{ height: 200, objectFit: "cover" }}
              />
            }
            actions={[
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => handleAddToCart(dish)}
                disabled={!dish.is_available}
              >
                Ajouter
              </Button>,
            ]}
          >
            <Meta
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{dish.name}</span>
                  <Text strong style={{ color: "#1890ff" }}>
                    {formatPrice(dish.price)}
                  </Text>
                </div>
              }
              description={
                <div>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                    {dish.description}
                  </Paragraph>

                  <div style={{ marginBottom: 8 }}>
                    {dish.is_vegetarian && <Tag color="green">Végétarien</Tag>}
                    {dish.is_vegan && <Tag color="green">Vegan</Tag>}
                    {dish.is_gluten_free && <Tag color="blue">Sans Gluten</Tag>}
                  </div>

                  {dish.preparation_time && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      ⏱️ {dish.preparation_time} min
                    </Text>
                  )}

                  {dish.calories && (
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", marginLeft: 8 }}
                    >
                      🔥 {dish.calories} cal
                    </Text>
                  )}
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DishGrid;
