require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Serve static assets if in production (optional future step)
// app.use(express.static(path.join(__dirname, '../dist')));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`- IBM Watson: ${process.env.IBM_WATSON_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`- Gemini: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`- Hugging Face: ${process.env.HUGGINGFACE_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`- Stable Diffusion: ${process.env.STABLE_DIFFUSION_API_KEY ? 'Configured' : 'Missing'}`);
});
