const { query } = require('../config/database');

class User {
  static async create(userData) {
    const {
      name, email, phone, location, preferences, password_hash
    } = userData;

    const text = `
      INSERT INTO users (name, email, phone, location, preferences, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [name, email, phone, location, JSON.stringify(preferences || {}), password_hash];
    const result = await query(text, values);
    
    // Get the created user by ID
    const createdUser = await this.findById(result.insertId);
    return createdUser;
  }

  static async findById(id) {
    const text = 'SELECT * FROM users WHERE id = ?';
    const result = await query(text, [id]);
    return result[0];
  }

  static async findByEmail(email) {
    const text = 'SELECT * FROM users WHERE email = ?';
    const result = await query(text, [email]);
    return result[0];
  }

  static async findByPhone(phone) {
    const text = 'SELECT * FROM users WHERE phone = ?';
    const result = await query(text, [phone]);
    return result[0];
  }

  static async findByEmailOrPhone(emailOrPhone) {
    const text = 'SELECT * FROM users WHERE email = ? OR phone = ?';
    const result = await query(text, [emailOrPhone, emailOrPhone]);
    return result[0];
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined && key !== 'id') {
        if (key === 'preferences') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const text = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await query(text, values);
    
    // Get the updated user
    const updatedUser = await this.findById(id);
    return updatedUser;
  }

  static async delete(id) {
    // First get the user to return
    const userToDelete = await this.findById(id);
    if (!userToDelete) {
      return null;
    }
    
    const text = 'DELETE FROM users WHERE id = ?';
    await query(text, [id]);
    return userToDelete;
  }

  static async list(limit = 50, offset = 0) {
    const text = `
      SELECT id, name, email, phone, location, preferences, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const result = await query(text, [limit, offset]);
    return result;
  }

  static async count() {
    const text = 'SELECT COUNT(*) as total FROM users';
    const result = await query(text);
    return parseInt(result[0].total);
  }
}

module.exports = User;