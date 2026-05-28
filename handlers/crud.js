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

exports.createUser = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const nombre = String(body.nombre ?? "").trim();
    const apellidos = String(body.apellidos ?? "").trim();
    const password = String(body.password ?? "cambiame").trim();
    const correo = String(body.correo ?? "").trim();
    const telefono = String(body.telefono ?? "").trim();
    const activo = body.activo ?? 1;
    const locale = String(body.locale ?? "es_ES").trim();
    const idEmpresa = body.id_empresa;
    const fechaNacimiento = body.fechaNacimiento;

    if (!nombre || !apellidos || !correo || !idEmpresa || !fechaNacimiento) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Faltan campos obligatorios",
          required: [
            "nombre",
            "apellidos",
            "correo",
            "id_empresa",
            "fechaNacimiento",
          ],
        }),
      };
    }

    if (!/^\S+@\S+\.\S+$/.test(correo)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Correo inválido",
        }),
      };
    }

    if (!/^\d+$/.test(String(idEmpresa))) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "ID de empresa inválido",
        }),
      };
    }

    const db = getPool();

    const [result] = await db.execute(
      `
      INSERT INTO User (
        firstName,
        lastName,
        password,
        email,
        phoneNumber,
        active,
        createdOn,
        locale,
        idEnterprise,
        birthday
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
      `,
      [
        nombre,
        apellidos,
        password,
        correo,
        telefono,
        activo,
        locale,
        idEmpresa,
        fechaNacimiento,
      ],
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Usuario creado correctamente",
        id: result.insertId,
        data: {
          id: result.insertId,
          nombre,
          apellidos,
          correo,
          telefono,
          activo,
          locale,
          id_empresa: Number(idEmpresa),
          fechaNacimiento,
        },
      }),
    };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "Ya existe un usuario con esos datos",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno",
        error: error.message,
      }),
    };
  }
};
