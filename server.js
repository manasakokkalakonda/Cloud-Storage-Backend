const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// In-memory data store as a fallback/primary database structure
let files = [];
let folders = [];

// Multer setup for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ==================== ROOT ROUTE FIX ====================
app.get('/', (req, res) => {
  res.send('Cloud Drive API is running successfully!');
});

// ==================== FILE ENDPOINTS ====================

// Get all files
app.get('/api/files', (req, res) => {
  res.json(files);
});

// Upload a file
app.post('/api/files', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const isImage = req.file.mimetype.startsWith('image/');
  const newFile = {
    id: `file-${Date.now()}`,
    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
    url: `/uploads/${req.file.filename}`,
    is_starred: false,
    is_trash: false,
    is_deleted: false,
    isImage: isImage,
    owner_email: req.body.owner_email || 'anonymous',
    shared: false,
    shared_with: [],
    role: 'Viewer'
  };

  files.unshift(newFile);
  res.status(201).json(newFile);
});

// Toggle Star Status
app.patch('/api/files/:id/star', (req, res) => {
  const { id } = req.params;
  const { isStarred } = req.body;
  
  const file = files.find(f => f.id === id || f._id === id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  file.is_starred = isStarred;
  res.json(file);
});

// Move File to Trash / Restore
app.patch('/api/files/:id/trash', (req, res) => {
  const { id } = req.params;
  const { isTrash } = req.body;

  const file = files.find(f => f.id === id || f._id === id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  file.is_trash = isTrash;
  file.is_deleted = isTrash;
  res.json(file);
});

// Update File Sharing
app.patch('/api/files/:id/share', (req, res) => {
  const { id } = req.params;
  const { shared, role, shared_with } = req.body;

  const file = files.find(f => f.id === id || f._id === id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  file.shared = shared;
  file.role = role || file.role;
  file.shared_with = shared_with || file.shared_with;
  res.json(file);
});

// Delete File Permanently
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;
  const fileIndex = files.findIndex(f => f.id === id || f._id === id);
  
  if (fileIndex === -1) return res.status(404).json({ error: 'File not found' });

  const [removedFile] = files.splice(fileIndex, 1);
  
  // Optionally remove actual physical file from uploads folder
  if (removedFile.url && removedFile.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, removedFile.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  res.json({ message: 'File deleted permanently' });
});

// ==================== FOLDER ENDPOINTS ====================

// Get all folders
app.get('/api/folders', (req, res) => {
  res.json(folders);
});

// Create folder
app.post('/api/folders', (req, res) => {
  const { name, owner_email } = req.body;
  if (!name) return res.status(400).json({ error: 'Folder name is required' });

  const newFolder = {
    id: `folder-${Date.now()}`,
    name,
    owner_email: owner_email || 'anonymous',
    is_starred: false,
    is_trash: false,
    is_deleted: false
  };

  folders.push(newFolder);
  res.status(201).json(newFolder);
});

// Move Folder to Trash / Restore
app.patch('/api/folders/:id/trash', (req, res) => {
  const { id } = req.params;
  const { isTrash } = req.body;

  const folder = folders.find(f => f.id === id || f._id === id);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  folder.is_trash = isTrash;
  folder.is_deleted = isTrash;
  res.json(folder);
});

// Delete Folder Permanently
app.delete('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  const folderIndex = folders.findIndex(f => f.id === id || f._id === id);
  
  if (folderIndex === -1) return res.status(404).json({ error: 'Folder not found' });

  folders.splice(folderIndex, 1);
  res.json({ message: 'Folder deleted permanently' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running smoothly on http://localhost:${PORT}`);
});