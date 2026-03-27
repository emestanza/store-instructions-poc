# Store Instructions CMS

Simple, lightweight CMS for managing store arrival instructions shown to zubaleros in the Zubale mobile app.

**JIRA**: FOSV2-1178  
**Status**: Phase 1 Complete - Backend & Admin UI Ready

## Architecture

Custom-built lightweight solution:
- **Backend**: Express + SQLite + TypeScript
- **Admin UI**: Vanilla JS (no framework overhead for POC)
- **Database**: SQLite (simple, file-based, no server setup)
- **File Storage**: Local filesystem with multer

## Features

- Store registry management
- Multi-block instructions (text, images, videos)
- Drag-and-drop block reordering
- Publish/unpublish instructions
- RESTful API for mobile consumption
- File upload support (images, videos)

## Quick Start

### 1. Install Dependencies

```bash
cd /var/www/store-instructions-cms
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Server will start at: http://localhost:3000

### 3. Load Sample Data (Optional)

```bash
sqlite3 database.sqlite < src/db/seed.sql
```

Then refresh the admin UI to see sample stores and instructions.

## API Endpoints

### Admin API (CRUD)

**Stores:**
- `GET /api/stores` - List all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

**Instructions:**
- `GET /api/instructions` - List all instructions
- `GET /api/instructions/:id` - Get instruction with blocks
- `POST /api/instructions` - Create instruction
- `PUT /api/instructions/:id` - Update instruction
- `DELETE /api/instructions/:id` - Delete instruction

**Blocks:**
- `POST /api/instructions/:id/blocks` - Add block
- `PUT /api/instructions/:id/blocks/:blockId` - Update block
- `DELETE /api/instructions/:id/blocks/:blockId` - Delete block
- `PUT /api/instructions/:id/reorder` - Reorder blocks

**Upload:**
- `POST /api/upload` - Upload image or video (multipart/form-data)

### Mobile API (Read-only)

**Get Store Instructions:**
```
GET /api/mobile/store-instructions/:store_id
```

Response format:
```json
{
  "success": true,
  "data": {
    "store_id": "store_001",
    "store_name": "Walmart Polanco",
    "instruction": {
      "id": "1",
      "title": "Instrucciones de llegada",
      "blocks": [
        {
          "id": "1",
          "type": "text",
          "position": 1,
          "content": {
            "text": "Bienvenido a Walmart..."
          }
        },
        {
          "id": "2",
          "type": "image",
          "position": 2,
          "content": {
            "image_url": "/uploads/12345.jpg",
            "caption": "Entrada principal",
            "alt_text": "Store entrance"
          }
        },
        {
          "id": "3",
          "type": "video",
          "position": 3,
          "content": {
            "video_url": "/uploads/67890.mp4",
            "thumbnail_url": "/uploads/thumb.jpg",
            "duration": 45
          }
        }
      ]
    }
  }
}
```

## Usage

### Managing Stores

1. Open http://localhost:3000
2. Go to "Stores" tab
3. Click "Add Store"
4. Fill in:
   - **External ID**: Zubale system store ID (e.g., `store_001`)
   - **Store Name**: Display name (e.g., `Walmart Polanco`)
   - **Brand ID & Name**: Optional brand information
   - **Active**: Toggle to enable/disable
5. Save

### Creating Instructions

1. Go to "Instructions" tab
2. Click "Create Instruction"
3. Select a store from dropdown
4. Set title (defaults to "Instrucciones de llegada")
5. Create (this opens the instruction editor)

### Editing Content Blocks

1. Click "Edit" on an instruction
2. Add blocks:
   - **Text**: Direct text content (instructions, warnings, tips)
   - **Image**: Upload or paste URL, add caption
   - **Video**: Upload or paste URL, add thumbnail
3. Reorder blocks with ↑↓ buttons
4. Delete unwanted blocks
5. Click "Publish" when ready

### Publishing

Only published (active) instructions are served via the mobile API. Draft instructions remain hidden until published.

## Project Structure

```
src/
├── db/
│   ├── database.ts      # SQLite wrapper with query helpers
│   ├── init.sql         # Database schema
│   └── seed.sql         # Sample data
├── routes/
│   ├── stores.ts        # Store CRUD endpoints
│   ├── instructions.ts  # Instruction CRUD endpoints
│   ├── mobile.ts        # Mobile consumption endpoint
│   └── upload.ts        # File upload endpoint
└── server.ts           # Express server entry point

public/
├── index.html          # Main admin dashboard
├── admin.js           # Dashboard logic
├── edit-instruction.html  # Instruction editor
├── edit-instruction.js    # Editor logic
├── admin-styles.css   # Shared styles
└── uploads/           # Uploaded files directory
```

## Testing the Mobile API

```bash
# Test with sample store
curl http://localhost:3000/api/mobile/store-instructions/store_001 | jq

# Expected response should include instruction with blocks
```

## Next Steps (Phase 2)

- [ ] Integrate Zubale design tokens in admin UI
- [ ] Add authentication for admin panel
- [ ] Improve block editor UX (rich text, preview)
- [ ] Add store import from CSV/API
- [ ] Deploy to dev environment

## Next Steps (Phase 3 - Mobile Integration)

- [ ] Create `StoreArrivalInstructions` component in zubale-app
- [ ] Add API method in Gateway.js
- [ ] Add constant for endpoint in Constants.js
- [ ] Test in mobile app

## Development

**Watch mode:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

**Production:**
```bash
npm start
```

## Database

SQLite database file: `database.sqlite`

To inspect:
```bash
sqlite3 database.sqlite
```

Common queries:
```sql
-- List all stores
SELECT * FROM stores;

-- List active instructions
SELECT i.*, s.name as store_name 
FROM instructions i 
JOIN stores s ON i.store_id = s.id 
WHERE i.active = 1;

-- Count blocks per instruction
SELECT instruction_id, COUNT(*) as block_count 
FROM instruction_blocks 
GROUP BY instruction_id;
```

## Environment Variables

See `.env`:
- `PORT` - Server port (default: 3000)
- `UPLOAD_DIR` - Upload directory (default: ./public/uploads)
- `NODE_ENV` - Environment (development/production)

## Notes

- SQLite is used for simplicity in POC. For production, consider PostgreSQL or MySQL.
- File uploads are stored locally. For production, use cloud storage (S3, GCS, etc.).
- Admin UI has no authentication. Add auth before production deployment.
- Mobile API is open (no auth). Add authentication in integration phase.

## Related Documentation

- Implementation Plan: `/var/www/STORE_INSTRUCTIONS_CMS_PLAN.md`
- Mobile App: `/var/www/zubale-app`

## 🚀 Deployment

This CMS can be deployed to production. See deployment guides:

- **Quick Start (Render.com)**: `QUICK_START_DEPLOY.md` - Deploy in 5 minutes (FREE)
- **All Options**: `DEPLOYMENT_OPTIONS.md` - Compare Render, Railway, Fly.io, Glitch

### Recommended: Render.com (Free Tier)

1. Push to GitHub
2. Connect to Render.com
3. Deploy automatically
4. Get public URL: `https://YOUR-APP.onrender.com`

**Read `QUICK_START_DEPLOY.md` for step-by-step instructions.**
