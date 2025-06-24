import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear errors when fields change
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setPasswordError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          city: formData.city,
          state: formData.state,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Signup successful!');
        navigate('/');
      } else {
        if (result.errors) {
          setFormError(result.errors.join('\n'));
        } else {
          setFormError(result.message || 'Signup failed.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('Server error. Please try again later.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="signup-container">
        <form className="row g-3 needs-validation" noValidate onSubmit={handleSubmit}>
          {formError && (
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            </div>
          )}
          
          <div className="col-md-4">
            <label htmlFor="firstName" className="form-label">First name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              required
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="lastName" className="form-label">Last name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              name="lastName"
              required
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              required
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              required
              onChange={handleChange}
            />
            <small className="text-muted">
              Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character
            </small>
          </div>

          <div className="col-md-6">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              required
              onChange={handleChange}
            />
            {passwordError && (
              <div className="text-danger mt-1">{passwordError}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="city" className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              id="city"
              name="city"
              required
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="state" className="form-label">State</label>
            <select
              className="form-select"
              id="state"
              name="state"
              required
              onChange={handleChange}
            >
              <option value="">Choose...</option>
              <option>Maharashtra</option>
              <option>Madhya Pradesh</option>
              <option>Kerela</option>
            </select>
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="invalidCheck"
                required
              />
              <label className="form-check-label" htmlFor="invalidCheck">
                Agree to terms and conditions
              </label>
              <div className="invalid-feedback">You must agree before submitting.</div>
            </div>
          </div>

          <div className="col-12">
            <button className="btn btn-primary" type="submit">Submit form</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
