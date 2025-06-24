import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Components/AuthContext";
import { CartProvider } from './Components/CartContext';
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Admin from "./Components/Admin";
import AdminLogin from "./Components/AdminLogin";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import Shop from './Components/Shop';

// Protected Route component for admin
const AdminRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  
  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/admin-login" />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />
              
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              
              <Route path="/admin-login" element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } />
              
              <Route path="/shop" element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              } />
              
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
