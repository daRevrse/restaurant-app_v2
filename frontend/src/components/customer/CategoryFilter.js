import React from "react";
import { Card, Space, Button } from "antd";
import { useMenu } from "../../hooks/useMenu";

const CategoryFilter = ({ categories }) => {
  const { selectedCategory, setSelectedCategory } = useMenu();

  return (
    <Card title="Catégories" size="small">
      <Space wrap>
        <Button
          type={selectedCategory === null ? "primary" : "default"}
          onClick={() => setSelectedCategory(null)}
        >
          Toutes
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            type={selectedCategory === category.id ? "primary" : "default"}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </Space>
    </Card>
  );
};

export default CategoryFilter;