const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve static files from root for specific HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/darul-ifta', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Fatwa Schema
const fatwaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    category: { type: String, required: true },
    question: { type: String, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Answered', 'Rejected'] },
    answer: { type: String },
    muftiName: { type: String },
    createdAt: { type: Date, default: Date.now },
    answeredAt: { type: Date }
});

const Fatwa = mongoose.model('Fatwa', fatwaSchema);

// API Routes

// Submit a new Fatwa
app.post('/api/fatwa', async (req, res) => {
    try {
        const { name, email, phone, category, question } = req.body;

        // Basic validation
        if (!name || !email || !category || !question) {
            return res.status(400).json({ message: 'تمام ضروری خانے پُر کریں۔' });
        }

        const newFatwa = new Fatwa({
            name,
            email,
            phone,
            category,
            question
        });

        await newFatwa.save();

        // TODO: Optional - Send email notification to Admin using nodemailer

        res.status(201).json({
            message: 'آپ کا فتویٰ کامیابی سے موصول ہو گیا ہے۔ جلد ہی ای میل کے ذریعے جواب دیا جائے گا۔',
            trackingId: newFatwa._id
        });

    } catch (error) {
        console.error('Error saving fatwa:', error);
        res.status(500).json({ message: 'سرور کا مسئلہ ہے۔ براہ کرم بعد میں کوشش کریں۔' });
    }
});

// Get recent answered fatwas (for homepage)
app.get('/api/fatwa/recent', async (req, res) => {
    try {
        const recentFatwas = await Fatwa.find({ status: 'Answered' })
            .sort({ answeredAt: -1 })
            .limit(6)
            .select('category question answer muftiName answeredAt'); // Only send necessary fields

        res.json(recentFatwas);
    } catch (error) {
        console.error('Error fetching recent fatwas:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Start Server (Only when not deployed on Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export the Express API for Vercel
module.exports = app;
