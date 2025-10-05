const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AuthModel {
  // Register a new user
  static async register(userData) {
    const { name, email, phone, password } = userData;
    
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = ? OR phone = ?',
        [email, phone]
      );
      
      if (existingUser.rows.length > 0) {
        throw new Error('User with this email or phone already exists');
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const userId = uuidv4();
      await query(
        `INSERT INTO users (id, name, email, phone, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, name, email, phone, hashedPassword]
      );
      
      // Get the created user
      const result = await query(
        'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
  
  // Login user
  static async login(credentials) {
    const { emailOrPhone, password } = credentials;
    
    try {
      // Find user by email or phone
      const result = await query(
        `SELECT id, name, email, phone, password_hash, created_at
         FROM users 
         WHERE email = ? OR phone = ?`,
        [emailOrPhone, emailOrPhone]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }
      
      const user = result.rows[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password hash from response
      delete user.password_hash;
      
      return user;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  
  // Get user by ID
  static async getUserById(userId) {
    try {
      const result = await query(
        `SELECT id, name, email, phone, location, preferences, created_at, updated_at
         FROM users 
         WHERE id = ?`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }
  
  // Update user profile
  static async updateProfile(userId, updates) {
    const { name, email, phone, location, preferences } = updates;
    
    try {
      // Check if email/phone is already taken by another user
      if (email || phone) {
        const existingUser = await query(
          'SELECT id FROM users WHERE (email = ? OR phone = ?) AND id != ?',
          [email || '', phone || '', userId]
        );
        
        if (existingUser.rows.length > 0) {
          throw new Error('Email or phone already taken by another user');
        }
      }
      
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      
      if (name) {
        updateFields.push('name = ?');
        values.push(name);
      }
      if (email) {
        updateFields.push('email = ?');
        values.push(email);
      }
      if (phone) {
        updateFields.push('phone = ?');
        values.push(phone);
      }
      if (location) {
        updateFields.push('location = ?');
        values.push(location);
      }
      if (preferences) {
        updateFields.push('preferences = ?');
        values.push(JSON.stringify(preferences));
      }
      
      updateFields.push('updated_at = NOW()');
      values.push(userId);
      
      await query(
        `UPDATE users SET ${updateFields.join(', ')} 
         WHERE id = ?`,
        values
      );
      
      // Get updated user
      const result = await query(
        'SELECT id, name, email, phone, location, preferences, updated_at FROM users WHERE id = ?',
        [userId]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }
  
  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      // Get current password hash
      const result = await query(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const currentHashedPassword = result.rows[0].password_hash;
      
      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, currentHashedPassword);
      if (!isOldPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const saltRounds = 12;
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      await query(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newHashedPassword, userId]
      );
      
      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }
  
  // Generate JWT token
  static generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      phone: user.phone
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
  
  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = AuthModel;