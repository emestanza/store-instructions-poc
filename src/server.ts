import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { initDatabase } from './db/database.js'
import storesRouter from './routes/stores.js'
import instructionsRouter from './routes/instructions.js'
import mobileRouter from './routes/mobile.js'
import uploadRouter from './routes/upload.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

// Serve admin UI
app.use(express.static(path.join(__dirname, '../public')))

// API Routes
app.use('/api/stores', storesRouter)
app.use('/api/instructions', instructionsRouter)
app.use('/api/mobile', mobileRouter)
app.use('/api/upload', uploadRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve admin UI for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

// Start server
const start = async () => {
  try {
    await initDatabase()
    console.log('✓ Database initialized')
    
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`)
      console.log(`✓ Admin UI: http://localhost:${PORT}`)
      console.log(`✓ API Docs: http://localhost:${PORT}/health\n`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
