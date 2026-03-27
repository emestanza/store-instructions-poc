import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Support for production environments with persistent disk
const getDbPath = () => {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH
  }
  
  // For Render.com persistent disk
  if (process.env.RENDER && process.env.RENDER_DISK_PATH) {
    return join(process.env.RENDER_DISK_PATH, 'store-instructions.db')
  }
  
  // Default local path
  return join(__dirname, '../../database.sqlite')
}

const DB_PATH = getDbPath()

// Ensure directory exists
const dbDir = dirname(DB_PATH)
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

console.log('Database path:', DB_PATH)

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err)
  } else {
    console.log('Connected to SQLite database at:', DB_PATH)
  }
})

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const initSQL = readFileSync(join(__dirname, 'init.sql'), 'utf-8')
    
    db.exec(initSQL, (err) => {
      if (err) {
        console.error('Error initializing database:', err)
        reject(err)
      } else {
        console.log('Database initialized successfully')
        // Run migration after initialization
        runMigration()
          .then(() => resolve())
          .catch((migErr) => {
            console.warn('Migration warning:', migErr.message)
            resolve() // Don't fail if migration has issues (column might already exist)
          })
      }
    })
  })
}

const runMigration = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if published_at column exists
    db.all("PRAGMA table_info(instructions)", (err, columns: any[]) => {
      if (err) {
        reject(err)
        return
      }
      
      const hasPublishedAt = columns.some(col => col.name === 'published_at')
      
      if (!hasPublishedAt) {
        console.log('Running migration: adding published_at column')
        const migrationSQL = readFileSync(join(__dirname, 'migrations/add_published_at.sql'), 'utf-8')
        
        db.exec(migrationSQL, (migErr) => {
          if (migErr) {
            reject(migErr)
          } else {
            console.log('✓ Migration completed: published_at column added')
            resolve()
          }
        })
      } else {
        console.log('Migration skipped: published_at column already exists')
        resolve()
      }
    })
  })
}

export const query = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows as T[])
      }
    })
  })
}

export const run = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

export const get = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row as T)
      }
    })
  })
}

export default db