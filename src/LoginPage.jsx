import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./assets/styles.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      console.log("Response:", data);
      console.log("Role:", data.role);

      if (response.ok) {
        localStorage.setItem("username", data.username);

        const role = data.role?.toUpperCase();

        if (role === "CUSTOMER") {
          navigate("/customerhome");
        } else if (role === "ADMIN") {
          navigate("/admindashboard");
        } else {
          setError("Unknown role: " + data.role);
        }
      } else {
        setError(data.error || "Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSignIn}>
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="form-input"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
          autoComplete="current-password"
        />

        <button type="submit" className="login-btn">
          Sign In
        </button>

        <p>
          New User? <a href="/register">Sign up here</a>
        </p>
      </form>
    </div>
  );
}