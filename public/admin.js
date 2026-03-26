// State
let stores = []
let instructions = []
let currentStore = null
let currentInstruction = null

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupTabs()
  loadStores()
  loadInstructions()
})

// Tab switching
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab
      
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
      
      tab.classList.add('active')
      document.getElementById(`${tabName}-tab`).classList.add('active')
    })
  })
}

// Stores
async function loadStores() {
  try {
    const response = await fetch('/api/stores')
    const data = await response.json()
    stores = data.data
    renderStores()
  } catch (error) {
    console.error('Error loading stores:', error)
  }
}

function renderStores() {
  const container = document.getElementById('stores-list')
  
  if (!stores.length) {
    container.innerHTML = '<p class="loading">No stores yet. Click "Add Store" to create one.</p>'
    return
  }
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>External ID</th>
          <th>Name</th>
          <th>Brand</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${stores.map(store => `
          <tr>
            <td>${store.external_id}</td>
            <td>${store.name}</td>
            <td>${store.brand_name || '-'}</td>
            <td>
              <span class="badge ${store.active ? 'badge-success' : 'badge-danger'}">
                ${store.active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="btn btn-primary" onclick="editStore(${store.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteStore(${store.id})">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function openStoreModal(store = null) {
  currentStore = store
  const modal = document.getElementById('store-modal')
  const title = document.getElementById('store-modal-title')
  
  if (store) {
    title.textContent = 'Edit Store'
    document.getElementById('store-id').value = store.id
    document.getElementById('external-id').value = store.external_id
    document.getElementById('store-name').value = store.name
    document.getElementById('address').value = store.address || ''
    document.getElementById('brand-id').value = store.brand_id || ''
    document.getElementById('brand-name').value = store.brand_name || ''
    document.getElementById('store-active').checked = store.active
  } else {
    title.textContent = 'Add Store'
    document.getElementById('store-form').reset()
    document.getElementById('store-id').value = ''
  }
  
  modal.classList.add('active')
}

function closeStoreModal() {
  document.getElementById('store-modal').classList.remove('active')
  currentStore = null
}

async function saveStore(e) {
  e.preventDefault()
  
  const id = document.getElementById('store-id').value
  const data = {
    external_id: document.getElementById('external-id').value,
    name: document.getElementById('store-name').value,
    address: document.getElementById('address').value,
    brand_id: parseInt(document.getElementById('brand-id').value) || null,
    brand_name: document.getElementById('brand-name').value,
    active: document.getElementById('store-active').checked ? 1 : 0,
  }
  
  try {
    const url = id ? `/api/stores/${id}` : '/api/stores'
    const method = id ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      closeStoreModal()
      await loadStores()
      alert('Store saved successfully')
    } else {
      alert('Error saving store')
    }
  } catch (error) {
    console.error('Error saving store:', error)
    alert('Error saving store')
  }
}

function editStore(id) {
  const store = stores.find(s => s.id === id)
  if (store) {
    openStoreModal(store)
  }
}

async function deleteStore(id) {
  if (!confirm('Are you sure you want to delete this store?')) return
  
  try {
    const response = await fetch(`/api/stores/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await loadStores()
      alert('Store deleted')
    } else {
      alert('Error deleting store')
    }
  } catch (error) {
    console.error('Error deleting store:', error)
    alert('Error deleting store')
  }
}

// Instructions
async function loadInstructions() {
  try {
    const response = await fetch('/api/instructions')
    const data = await response.json()
    instructions = data.data
    renderInstructions()
  } catch (error) {
    console.error('Error loading instructions:', error)
  }
}

function renderInstructions() {
  const container = document.getElementById('instructions-list')
  
  if (!instructions.length) {
    container.innerHTML = '<p class="loading">No instructions yet. Click "Create Instruction" to add one.</p>'
    return
  }
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Store</th>
          <th>Version</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${instructions.map(inst => `
          <tr>
            <td>${inst.title}</td>
            <td>${inst.store_name || 'Unknown'} (${inst.store_external_id || '-'})</td>
            <td>v${inst.version}</td>
            <td>
              <span class="badge ${inst.active ? 'badge-success' : 'badge-danger'}">
                ${inst.active ? 'Published' : 'Draft'}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="btn btn-primary" onclick="window.location.href='/edit-instruction.html?id=${inst.id}'">Edit</button>
                <button class="btn btn-secondary" onclick="previewInstruction(${inst.id})">Preview</button>
                <button class="btn btn-danger" onclick="deleteInstruction(${inst.id})">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

async function openInstructionModal() {
  await loadStores()
  
  const select = document.getElementById('instruction-store')
  select.innerHTML = '<option value="">Select a store...</option>' +
    stores.map(s => `<option value="${s.id}">${s.name} (${s.external_id})</option>`).join('')
  
  document.getElementById('instruction-modal').classList.add('active')
}

function closeInstructionModal() {
  document.getElementById('instruction-modal').classList.remove('active')
}

async function saveInstruction(e) {
  e.preventDefault()
  
  const data = {
    store_id: parseInt(document.getElementById('instruction-store').value),
    title: document.getElementById('instruction-title').value,
    active: document.getElementById('instruction-active').checked ? 1 : 0,
    blocks: [],
  }
  
  try {
    const response = await fetch('/api/instructions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    if (response.ok) {
      closeInstructionModal()
      window.location.href = `/edit-instruction.html?id=${result.data.id}`
    } else {
      alert('Error creating instruction')
    }
  } catch (error) {
    console.error('Error creating instruction:', error)
    alert('Error creating instruction')
  }
}

async function deleteInstruction(id) {
  if (!confirm('Are you sure you want to delete this instruction?')) return
  
  try {
    const response = await fetch(`/api/instructions/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await loadInstructions()
      alert('Instruction deleted')
    } else {
      alert('Error deleting instruction')
    }
  } catch (error) {
    console.error('Error deleting instruction:', error)
    alert('Error deleting instruction')
  }
}

function previewInstruction(id) {
  window.open(`/preview.html?id=${id}`, '_blank', 'width=375,height=667')
}
