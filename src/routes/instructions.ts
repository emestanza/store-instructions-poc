import express from 'express'
import { query, run, get } from '../db/database.js'

const router = express.Router()

// Get all instructions
router.get('/', async (req, res) => {
  try {
    const instructions = await query(`
      SELECT i.*, s.name as store_name, s.external_id as store_external_id
      FROM instructions i
      LEFT JOIN stores s ON i.store_id = s.id
      ORDER BY i.updated_at DESC
    `)
    res.json({ success: true, data: instructions })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get instruction by ID with blocks
router.get('/:id', async (req, res) => {
  try {
    const instruction = await get(`
      SELECT i.*, s.name as store_name, s.external_id as store_external_id
      FROM instructions i
      LEFT JOIN stores s ON i.store_id = s.id
      WHERE i.id = ?
    `, [req.params.id])
    
    if (!instruction) {
      return res.status(404).json({ success: false, message: 'Instruction not found' })
    }
    
    const blocks = await query(
      'SELECT * FROM instruction_blocks WHERE instruction_id = ? ORDER BY position',
      [req.params.id]
    )
    
    res.json({ success: true, data: { ...instruction, blocks } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create instruction
router.post('/', async (req, res) => {
  try {
    const { store_id, title, active, blocks } = req.body
    
    const result = await run(
      'INSERT INTO instructions (store_id, title, active) VALUES (?, ?, ?)',
      [store_id, title || 'Instrucciones de llegada', active || 0]
    )
    
    const instructionId = result.lastID
    
    // Insert blocks if provided
    if (blocks && Array.isArray(blocks)) {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        await run(
          `INSERT INTO instruction_blocks 
           (instruction_id, position, block_type, text_content, image_url, image_caption, image_alt, video_url, video_thumbnail_url, video_duration)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            instructionId,
            i + 1,
            block.block_type,
            block.text_content || null,
            block.image_url || null,
            block.image_caption || null,
            block.image_alt || null,
            block.video_url || null,
            block.video_thumbnail_url || null,
            block.video_duration || null,
          ]
        )
      }
    }
    
    const newInstruction = await get(`
      SELECT i.*, s.name as store_name
      FROM instructions i
      LEFT JOIN stores s ON i.store_id = s.id
      WHERE i.id = ?
    `, [instructionId])
    
    res.status(201).json({ success: true, data: newInstruction })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update instruction
router.put('/:id', async (req, res) => {
  try {
    const { title, active } = req.body
    
    // Get current active status
    const current = await get<{ active: number }>('SELECT active FROM instructions WHERE id = ?', [req.params.id])
    
    // Determine if we need to update published_at
    let updateSQL = 'UPDATE instructions SET title = ?, active = ?, updated_at = CURRENT_TIMESTAMP'
    const params: any[] = [title, active]
    
    // If changing from unpublished to published, set published_at
    if (current && current.active === 0 && active === 1) {
      updateSQL += ', published_at = CURRENT_TIMESTAMP'
    }
    // If unpublishing, clear published_at
    else if (current && current.active === 1 && active === 0) {
      updateSQL += ', published_at = NULL'
    }
    
    updateSQL += ' WHERE id = ?'
    params.push(req.params.id)
    
    await run(updateSQL, params)
    
    const updated = await get('SELECT * FROM instructions WHERE id = ?', [req.params.id])
    res.json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete instruction
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM instructions WHERE id = ?', [req.params.id])
    res.json({ success: true, message: 'Instruction deleted' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Add block to instruction
router.post('/:id/blocks', async (req, res) => {
  try {
    const { block_type, text_content, image_url, image_caption, image_alt, video_url, video_thumbnail_url, video_duration } = req.body
    
    // Get max position
    const maxPos = await get<{ max_pos: number }>(
      'SELECT COALESCE(MAX(position), 0) as max_pos FROM instruction_blocks WHERE instruction_id = ?',
      [req.params.id]
    )
    
    const result = await run(
      `INSERT INTO instruction_blocks 
       (instruction_id, position, block_type, text_content, image_url, image_caption, image_alt, video_url, video_thumbnail_url, video_duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id,
        (maxPos?.max_pos || 0) + 1,
        block_type,
        text_content || null,
        image_url || null,
        image_caption || null,
        image_alt || null,
        video_url || null,
        video_thumbnail_url || null,
        video_duration || null,
      ]
    )
    
    const newBlock = await get('SELECT * FROM instruction_blocks WHERE id = ?', [result.lastID])
    res.status(201).json({ success: true, data: newBlock })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update block
router.put('/:id/blocks/:blockId', async (req, res) => {
  try {
    const { block_type, text_content, image_url, image_caption, image_alt, video_url, video_thumbnail_url, video_duration } = req.body
    
    await run(
      `UPDATE instruction_blocks 
       SET block_type = ?, text_content = ?, image_url = ?, image_caption = ?, image_alt = ?, 
           video_url = ?, video_thumbnail_url = ?, video_duration = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [block_type, text_content, image_url, image_caption, image_alt, video_url, video_thumbnail_url, video_duration, req.params.blockId]
    )
    
    const updated = await get('SELECT * FROM instruction_blocks WHERE id = ?', [req.params.blockId])
    res.json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete block
router.delete('/:id/blocks/:blockId', async (req, res) => {
  try {
    await run('DELETE FROM instruction_blocks WHERE id = ?', [req.params.blockId])
    res.json({ success: true, message: 'Block deleted' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Reorder blocks
router.put('/:id/reorder', async (req, res) => {
  try {
    const { block_ids } = req.body // Array of block IDs in new order
    
    for (let i = 0; i < block_ids.length; i++) {
      await run(
        'UPDATE instruction_blocks SET position = ? WHERE id = ?',
        [i + 1, block_ids[i]]
      )
    }
    
    const blocks = await query(
      'SELECT * FROM instruction_blocks WHERE instruction_id = ? ORDER BY position',
      [req.params.id]
    )
    
    res.json({ success: true, data: blocks })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
