let instruction = null
let blocks = []

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  const instructionId = urlParams.get('id')
  
  if (instructionId) {
    loadInstruction(instructionId)
  } else {
    alert('No instruction ID provided')
    window.location.href = '/'
  }
})

async function loadInstruction(id) {
  try {
    const response = await fetch(`/api/instructions/${id}`)
    const data = await response.json()
    
    if (data.success) {
      instruction = data.data
      blocks = instruction.blocks || []
      renderInstruction()
    } else {
      alert('Instruction not found')
      window.location.href = '/'
    }
  } catch (error) {
    console.error('Error loading instruction:', error)
    alert('Error loading instruction')
  }
}

function renderInstruction() {
  document.getElementById('instruction-title-display').textContent = instruction.title
  document.getElementById('instruction-store-display').textContent = 
    `Store: ${instruction.store_name} (${instruction.store_external_id})`
  
  const publishBtn = document.getElementById('publish-btn')
  publishBtn.textContent = instruction.active ? 'Unpublish' : 'Publish'
  publishBtn.className = instruction.active ? 'btn btn-danger' : 'btn btn-success'
  
  renderBlocks()
}

function renderBlocks() {
  const container = document.getElementById('blocks-container')
  
  if (!blocks.length) {
    container.innerHTML = '<p class="loading">No blocks yet. Click "Add Block" to create content.</p>'
    return
  }
  
  container.innerHTML = blocks.map((block, index) => `
    <div class="block" 
         id="block-${block.id}" 
         draggable="true" 
         data-index="${index}"
         ondragstart="handleDragStart(event)"
         ondragover="handleDragOver(event)"
         ondrop="handleDrop(event)"
         ondragend="handleDragEnd(event)">
      <div class="block-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
          <span class="block-type">${block.block_type}</span>
        </div>
        <div class="actions">
          <button class="btn btn-primary" onclick="moveBlock(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn btn-primary" onclick="moveBlock(${index}, 1)" ${index === blocks.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="btn btn-danger" onclick="deleteBlock(${block.id})">Delete</button>
        </div>
      </div>
      
      ${renderBlockContent(block)}
    </div>
  `).join('')
}

let draggedIndex = null

function handleDragStart(event) {
  draggedIndex = parseInt(event.target.getAttribute('data-index'))
  event.target.style.opacity = '0.5'
  event.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  const target = event.target.closest('.block')
  if (target && target !== event.currentTarget) {
    target.classList.add('drag-over')
  }
  return false
}

function handleDrop(event) {
  event.preventDefault()
  
  const target = event.target.closest('.block')
  if (!target) return
  
  const dropIndex = parseInt(target.getAttribute('data-index'))
  
  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    const draggedBlock = blocks[draggedIndex]
    blocks.splice(draggedIndex, 1)
    blocks.splice(dropIndex, 0, draggedBlock)
    
    saveBlockOrder()
  }
  
  target.classList.remove('drag-over')
  return false
}

function handleDragEnd(event) {
  event.target.style.opacity = '1'
  document.querySelectorAll('.block').forEach(block => {
    block.classList.remove('drag-over')
  })
  draggedIndex = null
}

async function saveBlockOrder() {
  const blockIds = blocks.map(b => b.id)
  
  try {
    await fetch(`/api/instructions/${instruction.id}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_ids: blockIds }),
    })
    
    await loadInstruction(instruction.id)
  } catch (error) {
    console.error('Error reordering blocks:', error)
    alert('Error reordering blocks')
  }
}

function renderBlockContent(block) {
  switch (block.block_type) {
    case 'text':
      return `
        <div class="form-group">
          <textarea id="text-${block.id}" onchange="updateBlock(${block.id}, 'text_content', this.value)">${block.text_content || ''}</textarea>
        </div>
      `
    case 'image':
      return `
        <div class="form-group">
          <label>Image</label>
          <input type="file" accept="image/*" onchange="uploadFile(${block.id}, this, 'image_url')" />
          ${block.image_url ? `<img src="${block.image_url}" class="file-preview" />` : ''}
          <input type="text" value="${block.image_url || ''}" placeholder="Or paste URL" onchange="updateBlock(${block.id}, 'image_url', this.value)" />
        </div>
        <div class="form-group">
          <label>Caption</label>
          <input type="text" value="${block.image_caption || ''}" onchange="updateBlock(${block.id}, 'image_caption', this.value)" />
        </div>
      `
    case 'video':
      return `
        <div class="form-group">
          <label>Video</label>
          <input type="file" accept="video/*" onchange="uploadFile(${block.id}, this, 'video_url')" />
          <input type="text" value="${block.video_url || ''}" placeholder="Or paste URL" onchange="updateBlock(${block.id}, 'video_url', this.value)" />
        </div>
        <div class="form-group">
          <label>Thumbnail</label>
          <input type="file" accept="image/*" onchange="uploadFile(${block.id}, this, 'video_thumbnail_url')" />
          ${block.video_thumbnail_url ? `<img src="${block.video_thumbnail_url}" class="file-preview" />` : ''}
        </div>
      `
    default:
      return ''
  }
}

async function addBlock() {
  const blockType = prompt('Block type (text/image/video):', 'text')
  if (!blockType || !['text', 'image', 'video'].includes(blockType)) {
    alert('Invalid block type')
    return
  }
  
  try {
    const response = await fetch(`/api/instructions/${instruction.id}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_type: blockType }),
    })
    
    if (response.ok) {
      await loadInstruction(instruction.id)
    }
  } catch (error) {
    console.error('Error adding block:', error)
    alert('Error adding block')
  }
}

async function updateBlock(blockId, field, value) {
  const block = blocks.find(b => b.id === blockId)
  if (!block) return
  
  block[field] = value
  
  try {
    await fetch(`/api/instructions/${instruction.id}/blocks/${blockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(block),
    })
  } catch (error) {
    console.error('Error updating block:', error)
  }
}

async function deleteBlock(blockId) {
  if (!confirm('Delete this block?')) return
  
  try {
    const response = await fetch(`/api/instructions/${instruction.id}/blocks/${blockId}`, {
      method: 'DELETE',
    })
    
    if (response.ok) {
      await loadInstruction(instruction.id)
    }
  } catch (error) {
    console.error('Error deleting block:', error)
    alert('Error deleting block')
  }
}

async function uploadFile(blockId, input, urlField) {
  const file = input.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    if (data.success) {
      await updateBlock(blockId, urlField, data.data.url)
      await loadInstruction(instruction.id)
    } else {
      alert('Upload failed: ' + data.message)
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Error uploading file')
  }
}

async function moveBlock(index, direction) {
  if (index + direction < 0 || index + direction >= blocks.length) return
  
  const newIndex = index + direction
  const temp = blocks[index]
  blocks[index] = blocks[newIndex]
  blocks[newIndex] = temp
  
  const blockIds = blocks.map(b => b.id)
  
  try {
    await fetch(`/api/instructions/${instruction.id}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_ids: blockIds }),
    })
    
    await loadInstruction(instruction.id)
  } catch (error) {
    console.error('Error reordering blocks:', error)
    alert('Error reordering blocks')
  }
}

async function togglePublish() {
  const newStatus = instruction.active ? 0 : 1
  
  try {
    const response = await fetch(`/api/instructions/${instruction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: instruction.title,
        active: newStatus,
      }),
    })
    
    if (response.ok) {
      await loadInstruction(instruction.id)
      alert(newStatus ? 'Instruction published!' : 'Instruction unpublished')
    }
  } catch (error) {
    console.error('Error updating instruction:', error)
    alert('Error updating instruction')
  }
}

function previewInstruction() {
  window.open(`/preview.html?id=${instruction.id}`, '_blank', 'width=375,height=667')
}
