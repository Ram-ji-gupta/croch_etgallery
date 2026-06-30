const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "croch_etgallery"
};

let pool = null;
let useJsonDb = false;

const dbJsonPath = path.join(__dirname, "../db.json");

// Read data from db.json
function readJsonDb() {
  try {
    const raw = fs.readFileSync(dbJsonPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return { products: [], orders: [], customers: [], settings: {} };
  }
}

// Write data to db.json
function writeJsonDb(data) {
  try {
    fs.writeFileSync(dbJsonPath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to db.json:", err);
  }
}

// SQL Query Simulator for db.json fallback
function simulateQuery(sql, params = []) {
  const data = readJsonDb();
  const sqlNormalized = sql.trim().replace(/\s+/g, " ").toLowerCase();

  // 1. SELECT settings
  if (sqlNormalized.startsWith("select * from settings")) {
    return [[data.settings || {}]];
  }

  // 2. UPDATE settings
  if (sqlNormalized.startsWith("update settings")) {
    const [store_name, phone, email, address, admin_username, admin_password] = params;
    data.settings = {
      id: 1,
      store_name,
      phone,
      email,
      address,
      admin_username,
      admin_password
    };
    writeJsonDb(data);
    return [{ affectedRows: 1 }];
  }

  // 3. SELECT products
  if (sqlNormalized.startsWith("select * from products") || sqlNormalized.startsWith("select name, description, stock from products") || sqlNormalized.startsWith("select name, description from products")) {
    if (sqlNormalized.includes("where id =")) {
      const id = Number(params[0]);
      const product = data.products.find(p => p.id === id);
      return [product ? [product] : []];
    }
    const sorted = [...data.products].sort((a, b) => b.id - a.id);
    return [sorted];
  }

  // 4. INSERT product
  if (sqlNormalized.startsWith("insert into products")) {
    const [name, price, category, stock, image, description] = params;
    const nextId = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: nextId, name, price: String(price), category, stock: Number(stock), image, description };
    data.products.push(newProduct);
    writeJsonDb(data);
    return [{ insertId: nextId }];
  }

  // 5. UPDATE product
  if (sqlNormalized.startsWith("update products set")) {
    const [name, price, category, stock, image, description, id] = params;
    const idx = data.products.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      data.products[idx] = { ...data.products[idx], name, price: String(price), category, stock: Number(stock), image, description };
      writeJsonDb(data);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 6. DELETE product
  if (sqlNormalized.startsWith("delete from products")) {
    const id = Number(params[0]);
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length < initialLength) {
      writeJsonDb(data);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 7. SELECT customers
  if (sqlNormalized.startsWith("select * from customers") || sqlNormalized.startsWith("select id from customers")) {
    if (sqlNormalized.includes("where phone =")) {
      const phone = String(params[0]);
      const customer = data.customers.find(c => c.phone === phone);
      return [customer ? [customer] : []];
    }
    const sorted = [...data.customers].sort((a, b) => b.id - a.id);
    return [sorted];
  }

  // 8. INSERT customer
  if (sqlNormalized.startsWith("insert into customers")) {
    const [name, phone, email, address] = params;
    const nextId = data.customers.length > 0 ? Math.max(...data.customers.map(c => c.id)) + 1 : 1;
    const newCustomer = { id: nextId, name, phone, email, address };
    data.customers.push(newCustomer);
    writeJsonDb(data);
    return [{ insertId: nextId }];
  }

  // 9. DELETE customer
  if (sqlNormalized.startsWith("delete from customers")) {
    const id = Number(params[0]);
    const initialLength = data.customers.length;
    data.customers = data.customers.filter(c => c.id !== id);
    if (data.customers.length < initialLength) {
      writeJsonDb(data);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 10. SELECT orders
  if (sqlNormalized.startsWith("select") && sqlNormalized.includes("from orders")) {
    const sorted = [...data.orders].sort((a, b) => b.id - a.id);

    // Normalize total in fallback DB. Some seeded/updated records have "undefined" strings.
    const normalized = sorted.map(o => {
      let t = o.total;
      let status = o.status;

      // If total is invalid but status looks numeric, assume fields were corrupted and
      // the amount ended up in `status`.
      const tInvalid = t === undefined || t === null || t === 'undefined' || t === 'NaN' || t === '';
      const statusLooksNumeric = status !== undefined && status !== null && status !== '' && !Number.isNaN(Number(status));

      if (tInvalid && statusLooksNumeric) {
        return {
          ...o,
          total: String(Number(status)),
          status: 'Pending'
        };
      }

      if (tInvalid) {
        return { ...o, total: '0.00' };
      }

      const n = Number(t);
      if (Number.isFinite(n)) return { ...o, total: String(n) };

      return o;
    });

    return [normalized];
  }



  // 11. INSERT order
  if (sqlNormalized.startsWith("insert into orders")) {
    const [customer, phone, email, address, custom_requirement, status, total] = params;
    const nextId = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
    const newOrder = {
      id: nextId,
      customer,
      phone,
      email,
      address,
      custom_requirement,
      status: status || "Pending",
      created_at: new Date().toISOString(),
      total: String(total)
    };
    data.orders.push(newOrder);
    writeJsonDb(data);
    return [{ insertId: nextId }];
  }

  // 12. UPDATE order status
  if (sqlNormalized.startsWith("update orders set status =")) {
    const [status, id] = params;
    const idx = data.orders.findIndex(o => o.id === Number(id));
    if (idx !== -1) {
      data.orders[idx].status = status;
      writeJsonDb(data);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Avoid noisy logs in dev; return an empty result set for unknown queries.
  // This is mainly for the local JSON fallback mode.
  return [[]];
}

const mockConn = {
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  release: () => {},
  query: async (sql, params) => simulateQuery(sql, params)
};

const mockPool = {
  getConnection: async () => mockConn,
  query: async (sql, params) => simulateQuery(sql, params)
};

async function initializeDB() {
  try {
    console.log("Connecting to MySQL database...");
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();

    // Create the connection pool
    pool = mysql.createPool(dbConfig);
    console.log("Successfully connected to MySQL database!");

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY,
        store_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        address TEXT NOT NULL,
        admin_username VARCHAR(255) NOT NULL,
        admin_password VARCHAR(255) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        stock INT NOT NULL,
        image VARCHAR(255),
        description TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        email VARCHAR(255)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        address TEXT NOT NULL,
        custom_requirement TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10, 2) NOT NULL
      )
    `);

    // Seed data from db.json if database is empty
    const [settingsCount] = await pool.query("SELECT COUNT(*) as count FROM settings");
    const [productsCount] = await pool.query("SELECT COUNT(*) as count FROM products");
    const [customersCount] = await pool.query("SELECT COUNT(*) as count FROM customers");
    const [ordersCount] = await pool.query("SELECT COUNT(*) as count FROM orders");

    if (settingsCount[0].count === 0 || productsCount[0].count === 0) {
      if (fs.existsSync(dbJsonPath)) {
        try {
          const raw = fs.readFileSync(dbJsonPath, "utf8");
          const seedData = JSON.parse(raw);

          // Seed settings
          if (settingsCount[0].count === 0 && seedData.settings) {
            const s = seedData.settings;
            await pool.query(
              "INSERT INTO settings (id, store_name, phone, email, address, admin_username, admin_password) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [s.id || 1, s.store_name, s.phone, s.email, s.address, s.admin_username, s.admin_password]
            );
            console.log("Seeded settings from db.json");
          }

          // Seed products
          if (productsCount[0].count === 0 && seedData.products && seedData.products.length > 0) {
            for (const p of seedData.products) {
              await pool.query(
                "INSERT INTO products (id, name, price, category, stock, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [p.id, p.name, p.price, p.category, p.stock, p.image, p.description]
              );
            }
            console.log(`Seeded ${seedData.products.length} products from db.json`);
          }

          // Seed customers
          if (customersCount[0].count === 0 && seedData.customers && seedData.customers.length > 0) {
            for (const c of seedData.customers) {
              await pool.query(
                "INSERT INTO customers (id, name, phone, address, email) VALUES (?, ?, ?, ?, ?)",
                [c.id, c.name, c.phone, c.address, c.email]
              );
            }
            console.log(`Seeded ${seedData.customers.length} customers from db.json`);
          }

          // Seed orders
          if (ordersCount[0].count === 0 && seedData.orders && seedData.orders.length > 0) {
            for (const o of seedData.orders) {
              const createdAt = o.created_at ? new Date(o.created_at) : new Date();
              await pool.query(
                "INSERT INTO orders (id, customer, phone, email, address, custom_requirement, status, created_at, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [o.id, o.customer, o.phone, o.email, o.address, o.custom_requirement, o.status, createdAt, o.total]
              );
            }
            console.log(`Seeded ${seedData.orders.length} orders from db.json`);
          }
        } catch (err) {
          console.error("Error seeding from db.json:", err.message);
        }
      }
    }
  } catch (err) {
    console.warn("\n⚠️ MySQL Connection Failed. Error details:", err.message);
    console.warn("🔄 Falling back automatically to Local JSON Database (db.json)!");
    console.warn("💡 The server will run successfully using local file storage. No MySQL needed!\n");
    useJsonDb = true;
  }
}

function getPool() {
  if (useJsonDb) {
    return mockPool;
  }
  if (!pool) throw new Error("Database pool not initialized. Call initializeDB() first.");
  return pool;
}

module.exports = {
  initializeDB,
  getPool,
  query: (sql, params) => getPool().query(sql, params)
};
