const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");

db.connect(conn);

router.get("/", (req, res) => {
  conn.query("SELECT COUNT(*) AS num FROM user", [], (err, rows, fields) => {
    res.render("write", {
      num: rows[0].num
    });
  })
});

module.exports = router;