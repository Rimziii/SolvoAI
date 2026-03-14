const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'chatbot.db');
const db = new Database(dbPath);

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create chat_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      sender TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized successfully');
}

// User registration
function registerUser(email, password) {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const result = stmt.run(email, hashedPassword);
    return { success: true, userId: result.lastInsertRowid };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'Email already exists' };
    }
    return { success: false, error: error.message };
  }
}

// User login
function loginUser(email, password) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password' };
  }

  return { success: true, user: { id: user.id, email: user.email } };
}

// Get user by ID
function getUserById(userId) {
  const stmt = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?');
  return stmt.get(userId);
}

// Save chat message
function saveMessage(userId, message, sender) {
  const stmt = db.prepare('INSERT INTO chat_history (user_id, message, sender) VALUES (?, ?, ?)');
  return stmt.run(userId, message, sender);
}

// Get chat history for a user
function getChatHistory(userId, limit = 50) {
  const stmt = db.prepare(`
    SELECT id, message, sender, timestamp 
    FROM chat_history 
    WHERE user_id = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `);
  return stmt.all(userId, limit).reverse();
}

// Clear chat history for a user
function clearChatHistory(userId) {
  const stmt = db.prepare('DELETE FROM chat_history WHERE user_id = ?');
  return stmt.run(userId);
}

module.exports = {
  db,
  initializeDatabase,
  registerUser,
  loginUser,
  getUserById,
  saveMessage,
  getChatHistory,
  clearChatHistory
};
