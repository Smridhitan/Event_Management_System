const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "College@24",
  database: "Dbms_Project"
});

module.exports = db;

