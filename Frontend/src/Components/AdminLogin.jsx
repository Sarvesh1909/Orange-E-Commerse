import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { AuthContext } from './AuthContext';
import API_URL from '../utils/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Login successful", data.admin); // Optional: for debugging
        sessionStorage.setItem('admin', JSON.stringify(data.admin));
        sessionStorage.setItem('isAdmin', 'true');
        login(formData.username);
        navigate('/admin'); // Change this to your admin dashboard route
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-admin-login">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
