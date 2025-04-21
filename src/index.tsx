import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AllWords from "./pages/AllWords";
import AddWord from "./pages/AddWord";
import Quotes from "./pages/Quotes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);