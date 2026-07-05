import React, { useState, useEffect } from "react";
import { CategoryNavigation } from "./CategoryNavigation";
import { ProductList } from "./ProductList";
import { Footer } from "./Footer";
import { Header } from "./Header";
import "./assets/styles.css";

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState("");
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (username && username.trim() !== "") {
      fetchCartCount();
    }
  }, [username]);

  const fetchProducts = async (category = "") => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/products${
          category ? `?category=${category}` : ""
        }`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Products API Error:", response.status);
        setProducts([]);
        return;
      }

      const data = await response.json();

      console.log("Products API Response:", data);

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const fetchCartCount = async () => {
    if (!username || username.trim() === "") return;

    setIsCartLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/items/count?username=${username}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cart count");
      }

      const count = await response.json();

      setCartCount(count);
      setCartError(false);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    fetchProducts(category);
  };

  const handleAddToCart = async (productId) => {
    if (!username) {
      console.error("Username is required");
      return;
    }

    console.log("Username:", username);
    console.log("Product ID:", productId);

    try {
      const response = await fetch(
        "http://localhost:8080/api/cart/add",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            productId,
          }),
        }
      );

      console.log("Status:", response.status);

      const text = await response.text();
      console.log("Response:", text);

      if (response.ok) {
        alert("Added to cart successfully!");
        fetchCartCount();
      } else {
        console.error("Failed to add product to cart");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <div>
      <Header
        cartCount={
          isCartLoading ? "..." : cartError ? "0" : cartCount
        }
        username={username}
      />

      <nav className="navigation">
        <CategoryNavigation
          onCategoryClick={handleCategoryClick}
        />
      </nav>

      <main className="main-content">
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Footer />
    </div>
  );
}