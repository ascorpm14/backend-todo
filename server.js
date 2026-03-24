require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: "https://cute-selkie-3be4f8.netlify.app", // ton frontend Netlify
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// Routes - Using MOCK instead of MongoDB for now
app.use('/api', require('./routes/api-mock'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend running ✅ (MOCK MODE - No MongoDB)' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 MOCK MODE - Using in-memory data (not MongoDB)`);
});
