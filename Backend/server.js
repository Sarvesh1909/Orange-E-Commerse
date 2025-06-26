const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;
const JWT_SECRET = 'hello'; // In production, use environment variable

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sarvesh@123',
  database: process.env.DB_NAME || 'users_db',
}).promise(); // Use promise-based connection

// Handle database connection errors
db.connect()
  .then(async () => {
  console.log('Connected to MySQL');

  // Create users table if it doesn't exist
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // Create admin table if it doesn't exist
  const createAdminTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'moderator') NOT NULL DEFAULT 'admin',
        status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create admin_activity_log table
    const createAdminActivityLogTable = `
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create products table if it doesn't exist
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // Create tables
    await Promise.all([
      db.query(createUsersTable),
      db.query(createAdminTable),
      db.query(createAdminActivityLogTable),
      db.query(createProductsTable)
    ]);

      console.log('Users table ready');
    console.log('Admin tables ready');
    console.log('Products table ready');
    
    // Clean up existing admin accounts
    await db.query('DELETE FROM admins');
    await db.query('DELETE FROM admin_activity_log');
    console.log('Cleaned up existing admin accounts');
    
    // Create super admin account
    const superAdmin = {
        username: 'admin',
      password: 'Admin@123',
      email: 'admin@orangeapp.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin'
    };

    // Hash the super admin password
    const hashedPassword = await bcrypt.hash(superAdmin.password, 10);

    try {
      await db.query(
        `INSERT INTO admins (
          username, password, email, first_name, last_name, role
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          superAdmin.username,
          hashedPassword,
          superAdmin.email,
          superAdmin.firstName,
          superAdmin.lastName,
          superAdmin.role
        ]
      );
      console.log('Super admin account created successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('Admin account already exists');
          } else {
        throw error;
      }
    }
    
    // Initialize products if none exist
    const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
    
    if (rows[0].count === 0) {
      const initialProducts = [
        {
          name: 'Premium Navel Oranges',
          description: 'Sweet and juicy navel oranges, perfect for fresh juice',
          price: 249.00,
          image: 'https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          name: 'Organic Valencia Oranges',
          description: 'Organic valencia oranges, grown with care',
          price: 299.00,
          image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          name: 'Blood Oranges',
          description: 'Unique blood oranges with a distinct flavor',
          price: 329.00,
          image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          name: 'Family Combo Pack',
          description: 'Perfect for families, includes variety of oranges',
          price: 499.00,
          image: 'https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          name: 'Mixed Variety Pack',
          description: 'A mix of different orange varieties',
          price: 429.00,
          image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ];

      const insertQuery = 'INSERT INTO products (name, description, price, image) VALUES ?';
      const values = initialProducts.map(p => [p.name, p.description, p.price, p.image]);
      
      await db.query(insertQuery, [values]);
      console.log('Initial products added to database');
    }
  })
  .catch(err => {
    console.error('Database initialization error:', err);
    process.exit(1);
  });

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    // Get admin details from database
    const [admins] = await db.query('SELECT * FROM admins WHERE id = ?', [decoded.id]);
    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    const admin = admins[0];
    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is not active'
      });
    }

    req.admin = { ...decoded, role: admin.role };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
  const { username, password } = req.body;
    console.log('Admin login attempt:', { username, password: password ? '****' : undefined });

    // Validate username
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
        hint: 'Please provide a username'
      });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        hint: 'Please provide a password'
      });
    }

    // Get admin from database
    const [admins] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (admins.length === 0) {
      console.log('Admin not found:', username);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        hint: 'Default admin username is "admin"'
      });
    }

    const admin = admins[0];

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
        hint: 'Please contact the super admin'
      });
    }
    
    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (isMatch) {
      // Update last login
      await db.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

      // Log activity
      await db.query(
        'INSERT INTO admin_activity_log (admin_id, action, ip_address) VALUES (?, ?, ?)',
        [admin.id, 'login', req.ip]
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role,
          isAdmin: true
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Admin login successful:', username);
      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role
        }
      });
    } else {
      console.log('Invalid password for admin:', username);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        hint: 'Please check your password. The default password is "Admin@123" (case sensitive)'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// Admin dashboard
app.get('/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM products) as totalProducts,
        (SELECT COUNT(*) FROM admins) as totalAdmins
    `);
    
    const [recentActivity] = await db.query(`
      SELECT 
        al.*,
        a.username,
        a.first_name,
        a.last_name
      FROM admin_activity_log al
      JOIN admins a ON al.admin_id = a.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      stats: stats[0],
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get admin profile
app.get('/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT id, username, email, first_name, last_name, role, status, last_login, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );
    
    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin: admins[0]
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile'
    });
  }
});

// Update admin profile
app.put('/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    if (!firstName || !lastName || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

    await db.query(
      'UPDATE admins SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
      [firstName, lastName, email, req.admin.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO admin_activity_log (admin_id, action, details) VALUES (?, ?, ?)',
      [req.admin.id, 'update_profile', 'Updated profile information']
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change admin password
app.put('/admin/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false, 
        message: 'Current password and new password are required'
      });
    }

    // Get admin
    const [admins] = await db.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    const admin = admins[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false, 
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
            success: false, 
        message: 'Invalid new password',
        errors: passwordValidation.errors
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE admins SET password = ? WHERE id = ?',
      [hashedPassword, req.admin.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO admin_activity_log (admin_id, action, details) VALUES (?, ?, ?)',
      [req.admin.id, 'change_password', 'Changed password']
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// User signup
app.post('/api/signup', async (req, res) => {
  try {
    console.log('Received signup request:', req.body);
    const { firstName, lastName, username, city, state, password, confirmPassword } = req.body;
    const errors = [];

    // Validate required fields
    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!username) errors.push('Username is required');
    if (!city) errors.push('City is required');
    if (!state) errors.push('State is required');
    if (!password) errors.push('Password is required');
    if (!confirmPassword) errors.push('Confirm password is required');

    // Validate password match
    if (password && confirmPassword && password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Validate password strength
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        errors.push('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      }
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ success: false, errors });
    }

    // Check if username already exists
    console.log('Checking for existing username:', username);
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existingUsers.length > 0) {
      console.log('Username already exists:', username);
      return res.status(400).json({ success: false, errors: ['Username already exists'] });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    console.log('Attempting to insert new user...');
    const insertQuery = 'INSERT INTO users (first_name, last_name, username, city, state, password) VALUES (?, ?, ?, ?, ?, ?)';
    const insertValues = [firstName, lastName, username, city, state, hashedPassword];
    
    console.log('Query:', insertQuery);
    console.log('Values:', insertValues.map(v => typeof v === 'string' ? v.substring(0, 10) + '...' : v));

    const [result] = await db.query(insertQuery, insertValues);
    console.log('Insert result:', result);

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Detailed error in signup:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({ 
      success: false, 
      errors: ['Server error occurred'],
      details: error.message
    });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
  console.log('Received login request:', req.body);
  const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Get user from database
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      console.log('User not found:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    const user = users[0];
    console.log('Found user:', { 
      id: user.id, 
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name
    });

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful for user:', username);
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          city: user.city,
          state: user.state
        }
      });
    } else {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Server error occurred' 
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
  console.log('Fetching all users');
    const [users] = await db.query('SELECT id, first_name AS firstName, last_name AS lastName, username, city, state FROM users');
    console.log('Users fetched:', users);
    return res.status(200).json(users);
  } catch (error) {
    console.error('Database error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
  const { id } = req.params;
  const { firstName, lastName, username, city, state } = req.body;
  console.log('Updating user:', { id, firstName, lastName, username, city, state });
  
    const [result] = await db.query(
      `UPDATE users 
    SET first_name = ?, last_name = ?, username = ?, city = ?, state = ?
       WHERE id = ?`,
      [firstName, lastName, username, city, state, id]
    );
  
    console.log('User updated successfully:', result);
    return res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
  const { id } = req.params;
  console.log('Deleting user:', id);
  
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  
    console.log('User deleted successfully:', result);
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Add new product (admin only)
app.post('/api/products', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    
    if (!name || !description || !price || !image) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
      [name, description, price, image]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Product added successfully',
      productId: result.insertId 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Failed to add product' });
  }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;

    if (!name || !description || !price || !image) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
      [name, description, price, image, id]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// Admin user management middleware - only super_admin can access
const requireSuperAdmin = async (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admin can perform this action'
    });
  }
  next();
};

// List all admin users
app.get('/api/admin/users', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const [admins] = await db.query(`
      SELECT 
        id, username, email, first_name, last_name, role, status, 
        last_login, created_at, updated_at
      FROM admins 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users'
    });
  }
});

// Create new admin user
app.post('/api/admin/users', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!username || !password || !email || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate role
    if (!['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "admin" or "moderator"'
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
        errors: passwordValidation.errors
      });
    }

    // Check if username or email already exists
    const [existing] = await db.query(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [result] = await db.query(
      `INSERT INTO admins (
        username, password, email, first_name, last_name, role
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, email, firstName, lastName, role]
    );

    // Log activity
    await db.query(
      'INSERT INTO admin_activity_log (admin_id, action, details) VALUES (?, ?, ?)',
      [req.admin.id, 'create_admin', `Created new admin user: ${username}`]
    );

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      adminId: result.insertId
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user'
    });
  }
});

// Update admin user
app.put('/api/admin/users/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, status } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !role || !status) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate role
    if (!['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "admin" or "moderator"'
      });
    }

    // Validate status
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if email is already taken by another admin
    const [existing] = await db.query(
      'SELECT * FROM admins WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Update admin user
    await db.query(
      `UPDATE admins 
       SET email = ?, first_name = ?, last_name = ?, role = ?, status = ?
       WHERE id = ?`,
      [email, firstName, lastName, role, status, id]
    );

    // Log activity
    await db.query(
      'INSERT INTO admin_activity_log (admin_id, action, details) VALUES (?, ?, ?)',
      [req.admin.id, 'update_admin', `Updated admin user ID: ${id}`]
    );

    res.json({
      success: true,
      message: 'Admin user updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin user'
    });
  }
});

// Delete admin user
app.delete('/api/admin/users/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting super admin
    const [admin] = await db.query('SELECT role FROM admins WHERE id = ?', [id]);
    if (admin[0].role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin account'
      });
    }

    // Delete admin user
    await db.query('DELETE FROM admins WHERE id = ?', [id]);

    // Log activity
    await db.query(
      'INSERT INTO admin_activity_log (admin_id, action, details) VALUES (?, ?, ?)',
      [req.admin.id, 'delete_admin', `Deleted admin user ID: ${id}`]
    );

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin user'
    });
  }
});

// Reset admin password
app.post('/api/admin/users/:id/reset-password', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
        errors: passwordValidation.errors
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE admins SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    // Log activity
    await db.query(
      'INSERT INTO admin_activity_log (admin_id, action, details) VALUES (?, ?, ?)',
      [req.admin.id, 'reset_admin_password', `Reset password for admin user ID: ${id}`]
    );

    res.json({
      success: true,
      message: 'Admin password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset admin password'
    });
  }
});

// Delete user
app.delete('/api/admin/users/:userId', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Delete user from database
    const [result] = await db.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Start the server with error handling
app.listen(port, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
  console.log(`Server running at http://localhost:${port}`);
});
