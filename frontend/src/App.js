import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Navigation,
  Hero,
  CountdownTimer,
  DashboardPreview,
  Footer
} from "./components";

function App() {
  return (
    <div className="App bg-black text-white min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const HomePage = () => {
  return (
    <div className="relative">
      <Navigation />
      <Hero />
      <CountdownTimer />
      <DashboardPreview />
      <Footer />
    </div>
  );
};

export default App;