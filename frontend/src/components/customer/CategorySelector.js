import React from "react";
import { Button, Space, Card } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { useMenu } from "../../hooks/useMenu";
import { useResponsive } from "../../hooks/useResponsive";

const CategorySelector = () => {
  const { categories, selectedCategory, setSelectedCategory } = useMenu();
  const { isMobile } = useResponsive();

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  if (!categories.length) return null;

  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: isMobile ? 8 : 16 }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          overflowX: isMobile ? "auto" : "visible",
          padding: isMobile ? "0 0 8px 0" : 0,
        }}
      >
        <Button
          type={selectedCategory === null ? "primary" : "default"}
          onClick={() => handleCategorySelect(null)}
          icon={<AppstoreOutlined />}
          size={isMobile ? "small" : "default"}
        >
          Tout
        </Button>

        {categories.map((category) => (
          <Button
            key={category.id}
            type={selectedCategory === category.id ? "primary" : "default"}
            onClick={() => handleCategorySelect(category.id)}
            icon={category.icon ? <span>{category.icon}</span> : null}
            size={isMobile ? "small" : "default"}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default CategorySelector;
