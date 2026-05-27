require("dotenv").config();

const mysql = require("mysql2/promise");
let pool;

// ------------------------
// Helper functions
// ------------------------
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

// ------------------------
// Endpoints
// ------------------------
exports.getUser = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const id = String(body.id ?? "").trim();

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Introduce un ID" }),
      };
    }

    if (!/^\d+$/.test(id)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "ID inválido" }),
      };
    }

    const db = getPool();

    const [rows] = await db.execute(
      `
      SELECT
        id,
        firstName,
        lastName,
        email,
        phoneNumber,
        active,
        createdOn,
        locale,
        idEnterprise,
        birthday
      FROM User
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    if (rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Usuario no encontrado",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno",
        error: error.message,
      }),
    };
  }
};
