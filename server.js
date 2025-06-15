const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuration
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const VALID_USERS = ['alpha']; // Simple login (username-only)

// Middlewares
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') cb(null, true);
    else cb(new Error('Only MP4 files are allowed'));
  },
});

// Routes
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (VALID_USERS.includes(username)) {
    res.json({ token: 'basic-token', username });
  } else {
    res.status(401).json({ error: 'Invalid username' });
  }
});

app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`AlphaDrop server running at http://localhost:${PORT}`);
});
