import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // Import App component
import "./src/styles/LoginPage.css"; // Ensure styles are imported

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
