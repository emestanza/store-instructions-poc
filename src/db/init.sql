-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  brand_id INTEGER,
  brand_name TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Instructions table
CREATE TABLE IF NOT EXISTS instructions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT 'Instrucciones de llegada',
  active INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Instruction blocks table
CREATE TABLE IF NOT EXISTS instruction_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instruction_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  block_type TEXT NOT NULL CHECK(block_type IN ('text', 'image', 'video')),
  text_content TEXT,
  image_url TEXT,
  image_caption TEXT,
  image_alt TEXT,
  video_url TEXT,
  video_thumbnail_url TEXT,
  video_duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instruction_id) REFERENCES instructions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_external_id ON stores(external_id);
CREATE INDEX IF NOT EXISTS idx_instructions_store_id ON instructions(store_id);
CREATE INDEX IF NOT EXISTS idx_instructions_active ON instructions(active);
CREATE INDEX IF NOT EXISTS idx_blocks_instruction_id ON instruction_blocks(instruction_id);
CREATE INDEX IF NOT EXISTS idx_blocks_position ON instruction_blocks(position);
