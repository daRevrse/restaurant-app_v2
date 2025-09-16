import React, { useState } from "react";
import { Row, Col, Empty, Spin, Modal } from "antd";
import { useMenu } from "../../hooks/useMenu";
import { useResponsive } from "../../hooks/useResponsive";
import MenuItemCard from "./MenuItemCard";
import DishModal from "./DishModal";

const MenuGrid = () => {
  const { filteredDishes, loading, selectedCategory } = useMenu();
  const { isMobile } = useResponsive();
  const [selectedDish, setSelectedDish] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDishClick = (dish) => {
    setSelectedDish(dish);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedDish(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!filteredDishes.length) {
    return (
      <Empty
        description="Aucun plat trouvé"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: 50 }}
      />
    );
  }

  const getColSpan = () => {
    if (isMobile) return 12; // 2 colonnes sur mobile
    return 8; // 3 colonnes sur desktop
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ padding: isMobile ? 8 : 0 }}>
        {filteredDishes.map((dish) => (
          <Col key={dish.id} xs={12} sm={12} md={8} lg={6} xl={6}>
            <MenuItemCard
              dish={dish}
              onClick={() => handleDishClick(dish)}
              size={isMobile ? "small" : "default"}
            />
          </Col>
        ))}
      </Row>

      <Modal
        title={selectedDish?.name}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={isMobile ? "95%" : 600}
        centered
      >
        {selectedDish && (
          <DishModal dish={selectedDish} onClose={handleModalClose} />
        )}
      </Modal>
    </>
  );
};

export default MenuGrid;
