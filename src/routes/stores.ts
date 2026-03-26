import express from 'express'
import { query, run, get } from '../db/database.js'

const router = express.Router()

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await query('SELECT * FROM stores ORDER BY name')
    res.json({ success: true, data: stores })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const store = await get('SELECT * FROM stores WHERE id = ?', [req.params.id])
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' })
    }
    res.json({ success: true, data: store })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create store
router.post('/', async (req, res) => {
  try {
    const { external_id, name, address, latitude, longitude, brand_id, brand_name, active } = req.body
    
    const result = await run(
      `INSERT INTO stores (external_id, name, address, latitude, longitude, brand_id, brand_name, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [external_id, name, address || null, latitude || null, longitude || null, brand_id || null, brand_name || null, active !== undefined ? active : 1]
    )
    
    const newStore = await get('SELECT * FROM stores WHERE id = ?', [result.lastID])
    res.status(201).json({ success: true, data: newStore })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update store
router.put('/:id', async (req, res) => {
  try {
    const { name, address, latitude, longitude, brand_id, brand_name, active } = req.body
    
    await run(
      `UPDATE stores 
       SET name = ?, address = ?, latitude = ?, longitude = ?, brand_id = ?, brand_name = ?, active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, address, latitude, longitude, brand_id, brand_name, active, req.params.id]
    )
    
    const updated = await get('SELECT * FROM stores WHERE id = ?', [req.params.id])
    res.json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete store
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM stores WHERE id = ?', [req.params.id])
    res.json({ success: true, message: 'Store deleted' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
