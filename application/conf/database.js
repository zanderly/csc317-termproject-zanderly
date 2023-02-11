const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: "localhost",
    user: "photoapp",
    password: "12345678",
    database: "csc317db",
    connectionLimit: 50
});

module.exports = pool;