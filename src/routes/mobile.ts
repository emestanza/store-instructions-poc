import express from 'express'
import { query, get } from '../db/database.js'

const router = express.Router()

// Mobile endpoint: Get store instructions
router.get('/store-instructions/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params
    
    // Find store by external_id
    const store = await get(
      'SELECT * FROM stores WHERE external_id = ? AND active = 1',
      [store_id]
    )
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
        data: null,
      })
    }
    
    // Find active instruction for store
    const instruction = await get(
      'SELECT * FROM instructions WHERE store_id = ? AND active = 1 ORDER BY version DESC LIMIT 1',
      [store.id]
    )
    
    if (!instruction) {
      return res.status(404).json({
        success: false,
        message: 'No instructions found for store',
        data: null,
      })
    }
    
    // Get blocks
    const blocks = await query(
      'SELECT * FROM instruction_blocks WHERE instruction_id = ? ORDER BY position',
      [instruction.id]
    )
    
    // Format blocks for mobile
    const formattedBlocks = blocks.map((block: any) => {
      const baseBlock = {
        id: block.id.toString(),
        type: block.block_type,
        position: block.position,
      }
      
      switch (block.block_type) {
        case 'text':
          return {
            ...baseBlock,
            content: {
              text: block.text_content || '',
            },
          }
        case 'image':
          return {
            ...baseBlock,
            content: {
              image_url: block.image_url || '',
              caption: block.image_caption || '',
              alt_text: block.image_alt || '',
            },
          }
        case 'video':
          return {
            ...baseBlock,
            content: {
              video_url: block.video_url || '',
              thumbnail_url: block.video_thumbnail_url || '',
              duration: block.video_duration || 0,
            },
          }
        default:
          return baseBlock
      }
    })
    
    res.json({
      success: true,
      data: {
        store_id: store.external_id,
        store_name: store.name,
        instruction: {
          id: instruction.id.toString(),
          title: instruction.title,
          blocks: formattedBlocks,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching store instructions:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    })
  }
})

export default router
