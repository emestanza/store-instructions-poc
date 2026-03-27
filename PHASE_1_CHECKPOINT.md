# Phase 1 Checkpoint: CMS Backend & Admin UI

**Date**: March 26, 2026  
**Status**: ✅ Complete

## What Was Built

### 1. Backend API (Express + TypeScript + SQLite)

**Location**: `/var/www/store-instructions-cms`

**Tech Stack Decision**:
- Pivoted from Payload CMS to custom solution due to v3 ESM/CommonJS compatibility issues
- Express + TypeScript + SQLite = simpler, faster, more reliable for POC
- No framework overhead, full control over API design

**Database Schema** (`src/db/init.sql`):
- `stores` table: Store registry with external_id, name, address, brand info, active status
- `instructions` table: Store instructions with title, active flag, version tracking
- `instruction_blocks` table: Content blocks with type (text/image/video), position, and type-specific fields

**API Endpoints Implemented**:

Admin CRUD:
- `/api/stores` - Full CRUD for store management
- `/api/instructions` - Full CRUD for instructions
- `/api/instructions/:id/blocks` - Add/update/delete/reorder blocks
- `/api/upload` - File upload (images, videos up to 50MB)

Mobile API:
- `/api/mobile/store-instructions/:store_id` - Returns formatted instructions for mobile consumption

### 2. Admin UI (Vanilla JS + HTML)

**Admin UI Features**:
- Store management table with add/edit/delete
- Instructions table with store relationship display
- **Mobile preview button** - Opens phone-sized preview window showing exactly how zubaleros will see the content
- Block editor with:
  - Add blocks (text/image/video)
  - **Drag-drop reordering** - Grab and drag blocks to reorder (HTML5 native drag API)
  - Reorder blocks with ↑↓ buttons (alternative to drag-drop)
  - Delete blocks
  - Edit block content inline
  - File upload support
  - Visual feedback during drag operations
- Publish/unpublish toggle
- Clean, professional UI design with Zubale design tokens

**Files**:
- `public/index.html` - Main dashboard (stores & instructions tabs)
- `public/admin.js` - Dashboard logic
- `public/edit-instruction.html` - Instruction block editor
- `public/edit-instruction.js` - Editor logic
- `public/preview.html` - Mobile preview (phone-sized window)
- `public/admin-styles.css` - Shared styles

### 3. Sample Data

Loaded 3 sample stores:
- `store_001` - Walmart Polanco (with published instruction)
- `store_002` - Soriana Santa Fe
- `store_003` - Chedraui Coyoacán

Sample instruction with 3 text blocks for Walmart Polanco (published).

## Verification Tests

✅ Health endpoint: `http://localhost:3000/health`
✅ Stores API: Returns 3 stores
✅ Mobile API: Returns formatted instruction for `store_001` with correct JSON structure
✅ Admin UI: Loads and displays stores table
✅ Instructions UI: Shows instruction with store relationship
✅ Block Editor: Displays 3 blocks with edit/reorder/delete controls
✅ Add Block: Successfully adds new text block
✅ **Mobile Preview**: Opens phone-sized window (375x667) with formatted content - shows exactly how zubaleros will see it

## Mobile API Response Format (Verified)

```json
{
  "success": true,
  "data": {
    "store_id": "store_001",
    "store_name": "Walmart Polanco",
    "instruction": {
      "id": "1",
      "title": "Instrucciones de llegada - Walmart Polanco",
      "blocks": [
        {
          "id": "1",
          "type": "text",
          "position": 1,
          "content": {
            "text": "Bienvenido a Walmart Polanco..."
          }
        }
      ]
    }
  }
}
```

This format is ready for consumption by the mobile app.

## Server Status

Running on: `http://localhost:3000`  
Process: Active in background (nodemon with tsx)  
Database: SQLite at `/var/www/store-instructions-cms/database.sqlite`

## Files Created

```
/var/www/store-instructions-cms/
├── src/
│   ├── server.ts                    # Express server entry
│   ├── db/
│   │   ├── database.ts              # SQLite wrapper
│   │   ├── init.sql                 # Schema
│   │   └── seed.sql                 # Sample data
│   └── routes/
│       ├── stores.ts                # Store CRUD
│       ├── instructions.ts          # Instruction CRUD + blocks
│       ├── mobile.ts                # Mobile consumption endpoint
│       └── upload.ts                # File upload handler
├── public/
│   ├── index.html                   # Admin dashboard
│   ├── admin.js                     # Dashboard logic
│   ├── edit-instruction.html        # Block editor
│   ├── edit-instruction.js          # Editor logic
│   ├── preview.html                 # Mobile preview
│   ├── admin-styles.css             # Shared styles
│   └── uploads/                     # Upload directory
├── package.json
├── tsconfig.json
├── .env
├── .gitignore
└── README.md                        # Comprehensive docs
```

## Design Tokens Integration ✅

**Status**: Complete

Successfully integrated Zubale design tokens extracted from `@zubale/design-tokens` v3.5.0:

**Applied Design System**:
- **Colors**: Using official Zubale palette
  - Brand primary: `#0043FC` (Zubale blue)
  - Brand accent: `#02015D` (Zubale dark navy)
  - Neutral grays, positive/negative/warning semantic colors
- **Typography**: Lexend font family (imported from Google Fonts)
  - Font weights: light (300), regular (400), semibold (600), bold (700)
  - Font sizes: 10-60px scale matching mobile app
- **Spacing**: Consistent spacing scale (0.25rem - 6rem)

**Files Updated**:
- `public/tokens.css` - CSS variables for all design tokens
- `public/index.html` - Main dashboard with Zubale styling
- `public/edit-instruction.html` - Editor with Zubale styling
- `public/preview.html` - Mobile preview with Zubale styling
- `public/admin-styles.css` - Shared styles using design tokens

**Visual Changes**:
- Header: Zubale dark navy (`#02015D`) background
- Primary buttons: Zubale blue (`#0043FC`)
- Tabs: Blue underline for active state
- Cards: Clean white on light gray background
- Text blocks in preview: Blue left border accent
- Drag-drop blocks: Visual feedback with dashed borders and hover states

The admin UI now matches Zubale's visual identity across all pages with professional drag-drop UX.

## What's Next (Phase 2)

Phase 2 will focus on:
1. ~~Integrating Zubale design tokens (@zubale/design-tokens) into admin UI~~ ✅ **COMPLETE**
2. Improving block editor UX (image/video previews, better file handling)
3. Adding more robust validation and error handling
4. Testing all CRUD operations thoroughly

**Key question for Phase 2**: Should we also add authentication to the admin panel, or skip for POC and handle in production deployment?

## Technical Notes

- SQLite is file-based, no database server setup required
- File uploads stored in `public/uploads/` (served statically)
- CORS enabled for localhost and `*.zubale.com`
- TypeScript with ES modules (type: "module" in package.json)
- tsx used for dev server (handles ESM + TS seamlessly)

## Ready for Review

Phase 1 is complete and functional. The CMS:
- ✅ Stores data about stores
- ✅ Manages multi-block instructions
- ✅ Serves formatted API for mobile
- ✅ Provides admin UI for content management
- ✅ Supports text/image/video blocks
- ✅ Has working reorder and CRUD operations
- ✅ **Mobile preview** - Shows exactly how content will appear to zubaleros

**Preview Feature**:
- Click "Preview" button in instructions list or editor
- Opens phone-sized window (375x667 - iPhone dimensions)
- Shows formatted content with numbered blocks
- Displays gradient header matching mobile app aesthetic
- Includes "Continuar" button styled like mobile UI

**Approval needed to proceed to Phase 2.**
