import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import background from './background.jpg';
import './Home.css';

const Home = () => {
  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <h1 className="hero-title">Khandelwal Oranges</h1>
          <p className="hero-subtitle">Premium quality oranges, grown with traditional wisdom and modern care. Experience the authentic taste of nature's finest citrus.</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn-primary">Shop Now</Link>
            <button className="btn-secondary" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>
              Our Story
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src={background} alt="Khandelwal Oranges" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-card">
            <i className="fas fa-leaf"></i>
            <h3>100% Organic</h3>
            <p>Grown with natural farming methods</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-truck"></i>
            <h3>Direct from Farm</h3>
            <p>Fresh delivery from our orchards</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-heart"></i>
            <h3>Premium Quality</h3>
            <p>Hand-picked with care and expertise</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-content">
            <h2>The Khandelwal Legacy</h2>
            <p>For generations, the Khandelwal family has been cultivating the finest oranges in India. Our journey began with a simple mission: to provide families with the most delicious, nutritious oranges while maintaining sustainable farming practices. Today, we continue this legacy with modern techniques while preserving traditional wisdom.</p>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Years of Excellence</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Happy Families</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Natural Growth</span>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img src={background} alt="Khandelwal Orange Farm" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="contact-container">
          <h2>Connect With Us</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Our Farm</h3>
                  <p>Khandelwal Oranges Estate, Maharashtra</p>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-phone"></i>
                <div>
                  <h3>Call Us</h3>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h3>Email Us</h3>
                  <p>info@khandelwaloranges.com</p>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Subject" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Your Message" required></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive offers and farm updates</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="social-section">
        <div className="social-container">
          <h2>Follow Our Journey</h2>
          <div className="social-links">
            <a href="https://facebook.com/khandelwaloranges" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-facebook-f"></i>
              <span>@khandelwaloranges</span>
            </a>
            <a href="https://instagram.com/khandelwaloranges" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-instagram"></i>
              <span>@khandelwaloranges</span>
            </a>
            <a href="https://twitter.com/khandelwaloranges" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-twitter"></i>
              <span>@khandelwaloranges</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
