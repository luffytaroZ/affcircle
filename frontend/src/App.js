import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import DemoMode from "./pages/DemoMode";
import {
  Navigation,
  Hero,
  CountdownTimer,
  DashboardPreview,
  Footer
} from "./components";

function App() {
  return (
    <AuthProvider>
      <div className="App bg-black text-white min-h-screen">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<DemoMode />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
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