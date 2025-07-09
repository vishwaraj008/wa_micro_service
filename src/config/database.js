const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

let connection = null;

async function connect() {
  try {
    connection = await mysql.createConnection(config);
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

async function getConnection() {
  if (!connection) {
    await connect();
  }
  return connection;
}

async function query(sql, params = []) {
  try {
    const conn = await getConnection();
    const [results] = await conn.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function close() {
  if (connection) {
    await connection.end();
    connection = null;
  }
}

module.exports = {
  query,
  close
};
