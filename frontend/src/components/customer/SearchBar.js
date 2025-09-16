import React from "react";
import { Input, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMenu } from "../../hooks/useMenu";

const { Search } = Input;

const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useMenu();

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Search
        placeholder="Rechercher un plat..."
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        value={searchTerm}
        onChange={handleChange}
        onSearch={handleSearch}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default SearchBar;
