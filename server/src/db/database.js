const Database = require("better-sqlite3");
const path = require("path");

let db = null;

/**
 * Get or create database connection
 * @param {string} dbPath - Optional custom path for the database file
 * @returns {Database} The database instance
 */
function getDatabase(dbPath = null) {
  if (db) return db;

  const defaultPath = path.join(__dirname, "../../database.db");
  db = new Database(dbPath || defaultPath);
  db.pragma("journal_mode = WAL");

  return db;
}

/**
 * Close the database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Create database tables if they don't exist
 * @param {Database} database - The database instance
 */
function createTables(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL UNIQUE,
      quantity INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      purchase_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      cancelled_at DATETIME,
      FOREIGN KEY (product_id) REFERENCES products(id),
      CHECK (status IN ('active', 'cancelled'))
    );
  `);
}

/**
 * Sample products data for seeding
 */
const SAMPLE_PRODUCTS = [
  { name: "Laptop", description: "High-performance laptop", stock: 50 },
  { name: "Mouse", description: "Wireless optical mouse", stock: 200 },
  { name: "Keyboard", description: "Mechanical keyboard", stock: 150 },
  { name: "Monitor", description: "27-inch LED monitor", stock: 75 },
  {
    name: "Headphones",
    description: "Noise-cancelling headphones",
    stock: 100,
  },
  { name: "Webcam", description: "HD webcam with microphone", stock: 80 },
  { name: "USB Cable", description: "USB-C to USB-A cable", stock: 300 },
  { name: "HDMI Cable", description: "4K HDMI cable", stock: 250 },
  { name: "Desk Lamp", description: "LED desk lamp", stock: 120 },
  { name: "Phone Stand", description: "Adjustable phone stand", stock: 180 },
];

/**
 * Seed the database with sample products (idempotent)
 * @param {Database} database - The database instance
 * @returns {boolean} True if seeding was performed, false if data already exists
 */
function seedDatabase(database) {
  const existingCount = database
    .prepare("SELECT COUNT(*) as count FROM products")
    .get().count;

  if (existingCount > 0) {
    return false;
  }

  const insertProduct = database.prepare(
    "INSERT INTO products (name, description) VALUES (?, ?)"
  );
  const insertStock = database.prepare(
    "INSERT INTO stock (product_id, quantity) VALUES (?, ?)"
  );

  const seedTransaction = database.transaction(() => {
    for (const product of SAMPLE_PRODUCTS) {
      const result = insertProduct.run(product.name, product.description);
      insertStock.run(result.lastInsertRowid, product.stock);
    }
  });

  seedTransaction();
  return true;
}

/**
 * Initialize the database (create tables and seed data)
 * @param {Database} database - Optional database instance (creates new if not provided)
 * @returns {Database} The initialized database instance
 */
function initializeDatabase(database = null) {
  const db = database || getDatabase();
  createTables(db);
  seedDatabase(db);
  return db;
}

/**
 * Reset the database for testing (drops all tables and reinitializes)
 * @param {Database} database - The database instance
 */
function resetDatabase(database) {
  database.exec(`
    DROP TABLE IF EXISTS purchases;
    DROP TABLE IF EXISTS stock;
    DROP TABLE IF EXISTS products;
  `);
  createTables(database);
  seedDatabase(database);
}

module.exports = {
  getDatabase,
  closeDatabase,
  createTables,
  seedDatabase,
  initializeDatabase,
  resetDatabase,
  SAMPLE_PRODUCTS,
};
