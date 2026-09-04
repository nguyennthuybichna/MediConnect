const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const apiRouter = require('./routes/api');
const startReminderJob = require('./cronjobs/reminderJob');

const app = express();
const PORT = process.env.PORT || 5001;

// Khởi chạy cronjob nhắc nhở lịch khám tự động
startReminderJob();


app.use(cors());
app.use(express.json());

app.use('/', apiRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MediConnect Backend Server đang hoạt động ổn định.',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port: http://localhost:${PORT}`);
});
