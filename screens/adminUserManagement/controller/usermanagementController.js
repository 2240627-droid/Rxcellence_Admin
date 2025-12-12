const db = require("../../../server/config/db");
const { Parser } = require("json2csv");
const path = require("path");

exports.dashboard = (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/usermanagement.html"));
};

exports.listDoctors = async (req, res) => {
  try {
    const [doctors] = await db.query("SELECT * FROM doctors");
    res.render("doctors", { doctors });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.listPharmacists = async (req, res) => {
  try {
    const [pharmacists] = await db.query("SELECT * FROM pharmacists");
    res.render("pharmacists", { pharmacists });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = `SELECT * FROM account_requests WHERE 1`;
    const params = [];

    if (search) {
      query += ` AND name LIKE ?`;
      params.push(`%${search}%`);
    }
    if (role) {
      query += ` AND user_type = ?`;
      params.push(role);
    }
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    console.log("SQL Query:", query, "Params:", params); // debug

    const [rows] = await db.query(query, params);
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.execute(
      `UPDATE account_requests SET status = ? WHERE request_id = ?`,
      [status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export CSV with filters
exports.exportUsersCSV = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    let query = "SELECT * FROM account_requests WHERE 1";
    const params = [];

    if (search) {
      query += " AND name LIKE ?";
      params.push(`%${search}%`);
    }
    if (role) {
      query += " AND user_type = ?";
      params.push(role);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    const [rows] = await db.execute(query, params);

    if (rows.length === 0) return res.status(404).send("No users to export.");

    const fields = [
      "request_id",
      "user_type",
      "license_number",
      "name",
      "affiliated_id",
      "status",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Bulk update controller
exports.bulkUpdateUsersStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || ids.length === 0)
      return res.json({ success: false, message: "No users selected" });

    const placeholders = ids.map(() => "?").join(",");
    const sql = `UPDATE account_requests SET status = ? WHERE request_id IN (${placeholders})`;

    await db.execute(sql, [status, ...ids]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.json({ success: false, message: "No users selected" });
    }

    const placeholders = ids.map(() => "?").join(",");

    const sql = `DELETE FROM account_requests WHERE request_id IN (${placeholders})`;

    await db.execute(sql, ids);

    res.json({ success: true });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
