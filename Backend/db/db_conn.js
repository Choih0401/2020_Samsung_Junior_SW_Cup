const mysql = require("mysql");
const config = require("./db_config");

module.exports = () => {
  return {
    init: () => {
      return connection;
    },
  };
};

let connection = mysql.createConnection({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
});

connection.connect((err) => {
  if (err) throw err;
});
