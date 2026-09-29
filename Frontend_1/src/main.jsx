import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/global.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "12px",
            background: "var(--bg-modal)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
