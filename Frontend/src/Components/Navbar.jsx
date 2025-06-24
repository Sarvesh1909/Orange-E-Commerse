import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useCart } from "./CartContext";
import CartPopup from "./CartPopup";
import logo from "./logo.png";
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const { cartItems, updateQuantity, removeFromCart, getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin');
    sessionStorage.removeItem('isAdmin');
    logout();
    navigate("/login");
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className={`navbar navbar-expand-lg ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="Logo" />
          </Link>
          <button
            className={`navbar-toggler ${isMenuOpen ? 'active' : ''}`}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link 
                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                to="/" 
                onClick={() => scrollToSection('home')}
              >
                Home
              </Link>
              <Link 
                className={`nav-link ${isActive('/shop') ? 'active' : ''}`} 
                to="/shop"
              >
                Shop
              </Link>
              <Link 
                className={`nav-link ${location.hash === '#contact' ? 'active' : ''}`} 
                to="/#contact" 
                onClick={() => scrollToSection('contact')}
              >
                Contact
              </Link>
              <Link 
                className={`nav-link ${location.hash === '#about' ? 'active' : ''}`} 
                to="/#about" 
                onClick={() => scrollToSection('about')}
              >
                About Us
              </Link>
              {isLoggedIn && isAdmin && (
                <Link 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`} 
                  to="/admin"
                >
                  Admin
                </Link>
              )}
            </div>
            <div className="d-flex align-items-center">
              <button 
                className="cart-btn"
                onClick={() => setIsCartOpen(true)}
              >
                <i className="fas fa-shopping-cart"></i>
                {getTotalItems() > 0 && (
                  <span className="cart-badge">{getTotalItems()}</span>
                )}
              </button>
              {isLoggedIn ? (
                <>
                  <div className="user-profile">
                    <i className="fas fa-user-circle"></i>
                    <span className="username">{user?.username}</span>
                  </div>
                  <button 
                    className="btn btn-danger" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`login-btn ${isActive('/login') ? 'active' : ''}`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`signup-btn ${isActive('/signup') ? 'active' : ''}`}
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartPopup
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </>
  );
};

export default Navbar;