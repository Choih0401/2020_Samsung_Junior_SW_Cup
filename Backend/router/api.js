const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();

db.connect(conn);

router.post("/register", (req, res) => {
  if (!req.body.id || !req.body.pw) {
    res.json({ success: false });
  }
  conn.query(
    "SELECT * FROM user WHERE id=?",
    [req.body.id],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ err: "1" });
      if (rows.length > 0) {
        return res.json({ success: false });
      }
      let salt = crypto.randomBytes(8).toString("base64");
      let key = crypto
        .createHash("sha256")
        .update(req.body.pw + salt)
        .digest("byte");
      let iv = crypto.randomBytes(16);
      let BCKey = "asdf"; // later
      let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      let encBCKey = cipher.update(BCKey, "utf8", "base64");
      encBCKey += cipher.final("base64");

      conn.query(
        "INSERT INTO user (id, salt, iv, encBCKey) VALUES (?, ?, ?, ?)",
        [req.body.id, salt, iv.toString("base64"), encBCKey],
        (err, rows, fields) => {
          if (err) return res.status(500).json({ err: "2" });
          return res.json({ success: true });
        }
      );
    }
  );
});

router.post("/login", (req, res) => {
  if (!req.body.id || !req.body.pw) {
    res.json({ success: false });
  }
  conn.query(
    "SELECT id, salt, iv, encBCKey FROM user WHERE id=?",
    [req.body.id],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ err: "1" });
      if (rows.length == 0) {
        return res.json({ success: false });
      }
      let id = req.body.id;
      let salt = rows[0].salt;
      let iv = rows[0].iv;
      let encBCKey = rows[0].encBCKey;
      let BCKey = "";
      try {
        let key = crypto
          .createHash("sha256")
          .update(req.body.pw + salt)
          .digest("byte");
        let decipher = crypto.createDecipheriv(
          "aes-256-cbc",
          key,
          Buffer.from(iv, "base64")
        );
        BCKey = decipher.update(encBCKey, "base64", "utf8");
        BCKey += decipher.final("utf8");
      } catch {
        return res.status(401).json({ success: false }); // pw wrong
      }
      console.log(BCKey);
      return res.json({ success: true });
    }
  );
});

module.exports = router;
