const db = require("../config/db");

// ==========================
// GET ALL ORDERS
// ==========================
exports.getOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, customer, phone, email, address, custom_requirement, status, created_at, total FROM orders ORDER BY id DESC"
    );

    // Normalize total to a consistent field so the admin UI can always read it.
    // MySQL may return Decimal as string.
    const normalized = rows.map(o => {
      const t = o.total;
      let totalNum = null;
      if (t !== null && t !== undefined && t !== "") {
        const n = Number(t);
        totalNum = Number.isFinite(n) ? n : null;
      }

      return {
        ...o,
        total: totalNum === null ? o.total : totalNum
      };
    });

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// CREATE ORDER
// ==========================
exports.createOrder = async (req, res) => {
  const conn = await db.getPool().getConnection();
  try {
    const { customer, phone, email, address, custom_requirement, items } = req.body;

    if (!items || items.length === 0) {
      conn.release();
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;
    items.forEach(item => total += Number(item.price) * Number(item.qty));

    await conn.beginTransaction();

    // Enrich items, verify stock and decrement in DB
    const itemsDetailed = [];
    for (const item of items) {
      const [rows] = await conn.query("SELECT name, description, stock FROM products WHERE id = ? LIMIT 1 FOR UPDATE", [item.id]);
      if (rows.length === 0) {
        throw new Error(`Product #${item.id} not found`);
      }
      
      const product = rows[0];
      if (product.stock < item.qty) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.qty}`);
      }

      // Decrement stock
      const newStock = product.stock - item.qty;
      await conn.query("UPDATE products SET stock = ? WHERE id = ?", [newStock, item.id]);

      itemsDetailed.push({
        id: item.id,
        name: product.name,
        description: product.description || "",
        price: item.price,
        qty: item.qty
      });
    }

    // Auto-register customer if not already in customers table
    const [existing] = await conn.query("SELECT id FROM customers WHERE phone = ? LIMIT 1", [phone]);
    if (existing.length === 0) {
      await conn.query(
        "INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)",
        [customer, phone, email || null, address]
      );
    }

    // Insert order into orders table
    const [result] = await conn.query(
      "INSERT INTO orders (customer, phone, email, address, custom_requirement, status, total) VALUES (?, ?, ?, ?, ?, 'Pending', ?)",
      [customer, phone, email || null, address, custom_requirement || null, total.toFixed(2)]
    );

    await conn.commit();

    res.json({
      message: "Order Placed Successfully",
      orderId: result.insertId,
      status: "Pending",
      itemsDetailed
    });
  } catch (err) {
    await conn.rollback();
    console.error("Create order error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

// ==========================
// UPDATE STATUS
// ==========================
exports.updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const [result] = await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Status Updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// DELETE ORDER
// ==========================
exports.deleteOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await db.query("DELETE FROM orders WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

