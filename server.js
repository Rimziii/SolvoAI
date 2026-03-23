const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Global error handler


const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Initialize database
const db = require('./database');
db.initializeDatabase();

// Middleware
app.use(bodyParser.json({ limit: '200kb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Password strength validation
function isPasswordStrong(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8 && 
         /[a-zA-Z]/.test(password) && 
         /[0-9]/.test(password) && 
         /[@#$!%]/.test(password);
}

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/register', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password strength
  if (!isPasswordStrong(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters, contain a letter, a number, and a special symbol (@#$!%)' 
    });
  }

  // Register in database
  const result = db.registerUser(email, password);
  
  if (result.success) {
    res.status(201).json({ message: 'User registered successfully' });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Login user
app.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate credentials against database
  const result = db.loginUser(email, password);
  
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: result.user.id, email: result.user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ 
    token,
    user: { id: result.user.id, email: result.user.email }
  });
});

// Logout (client-side token removal, but we can track it server-side if needed)
app.post('/logout', authenticateToken, (req, res) => {
  // In a more advanced implementation, you could blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// Verify token
app.get('/verify', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ 
    user: { id: user.id, email: user.email },
    token: req.headers['authorization']?.split(' ')[1]
  });
});

// ==================== CHAT ROUTES ====================

// Save message to history (protected)
app.post('/save-message', authenticateToken, (req, res) => {
  const { message, sender } = req.body;
  
  if (!message || !sender) {
    return res.status(400).json({ error: 'Message and sender are required' });
  }

  try {
    db.saveMessage(req.user.userId, message, sender);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Get chat history (protected)
app.get('/chat-history', authenticateToken, (req, res) => {
  try {
    const history = db.getChatHistory(req.user.userId);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

// Clear chat history (protected)
app.delete('/chat-history', authenticateToken, (req, res) => {
  try {
    db.clearChatHistory(req.user.userId);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// ==================== GROQ API CHAT ROUTES ====================

// Public chat endpoint (no login required)
app.post('/chat/public', (req, res) => {
  const { messages } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const postData = JSON.stringify({
    model: 'groq/compound',
    messages: messages,
    temperature: 0.7,
    max_tokens: 1024
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse Groq response', details: data });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'API request failed', details: error.message });
  });

  request.write(postData);
  request.end();
});

// Protected chat endpoint (requires login - for saving chat history)
app.post('/chat', authenticateToken, (req, res) => {
  const { messages } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const postData = JSON.stringify({
    model: 'groq/compound',
    messages: messages,
    temperature: 0.7,
    max_tokens: 1024
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse Groq response', details: data });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'API request failed', details: error.message });
  });

  request.write(postData);
  request.end();
});

// ==================== CODE CHECKING ROUTES ====================

app.post('/check-code', authenticateToken, (req, res) => {
  const { code, language } = req.body;
  let result = { isCorrect: false, message: '', correctedCode: '' };

  const detectedLanguage = language || detectLanguage(code);

  if (!detectedLanguage) {
    result.message = 'Unable to detect programming language.';
    return res.json(result);
  }

  checkCode(code, detectedLanguage, (error, output) => {
    if (error) {
      result.message = `Syntax error: ${error}`;
      result.correctedCode = generateCorrectedCode(code, detectedLanguage, error);
    } else {
      result.isCorrect = true;
      result.message = 'Code ran successfully.' + (output ? '\nOutput:\n' + output : '');
    }
    res.json(result);
  });
});

function detectLanguage(code) {
  if (code.includes('#include') || code.includes('int main')) return 'c';
  if (code.includes('#include <iostream>') || code.includes('std::cout')) return 'cpp';
  if (code.includes('function') || code.includes('console.log')) return 'javascript';
  if (code.includes('def ') || code.includes('import ')) return 'python';
  return null;
}

function checkCode(code, language, callback) {
  if (!code || code.length === 0) return callback('No code provided');
  if (code.length > 20000) return callback('Code too long');

  const ext = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'javascript' ? 'js' : 'py';
  const tempFile = path.join(os.tmpdir(), `temp-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);

  try {
    fs.writeFileSync(tempFile, code, { encoding: 'utf8' });
  } catch (err) {
    return callback('Failed to write temp file');
  }

  let command;
  switch (language) {
    case 'c':
      command = `gcc ${tempFile} -o ${tempFile}.exe && ${tempFile}.exe`;
      break;
    case 'cpp':
      command = `g++ ${tempFile} -o ${tempFile}.exe && ${tempFile}.exe`;
      break;
    case 'javascript':
      command = `node ${tempFile}`;
      break;
    case 'python':
      command = `python ${tempFile}`;
      break;
    default:
      try { fs.unlinkSync(tempFile); } catch {}
      return callback('Unsupported language');
  }

  const execOptions = { timeout: 5000, maxBuffer: 1024 * 1024 };

  exec(command, execOptions, (error, stdout, stderr) => {
    try { fs.unlinkSync(tempFile); } catch (e) {}
    try { fs.unlinkSync(`${tempFile}.exe`); } catch (e) {}

    if (error) {
      const msg = (stderr || error.message || '').toString();
      return callback(msg || 'Execution error');
    }
    return callback(null, stdout || '');
  });
}

function generateCorrectedCode(code, language, error) {
  if (language === 'python' && error.includes('SyntaxError')) {
    return code.replace(/print\(/g, 'print(').replace(/,$/, ')');
  }
  return 'Corrected code would go here based on error analysis.';
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
