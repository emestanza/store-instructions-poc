import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads')
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true })
  console.log('Created uploads directory:', uploadsDir)
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only images and videos are allowed'))
    }
  },
})

// Upload file endpoint
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }
    
    const fileUrl = `/uploads/${req.file.filename}`
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
