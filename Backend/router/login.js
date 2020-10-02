const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");

db.connect(conn);

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", (req, res) => {
  if (!req.body.LoginId || !req.body.LoginPasswd) {
    return res.send(
      "<script>alert('빈칸이 있습니다.');history.go(-1);</script>"
    );
  }
  conn.query(
    "SELECT id, name, resident, salt, iv, encBCKey, address FROM user WHERE id=?",
    [req.body.LoginId],
    (err, rows, fields) => {
      if (err)
        return res.send(
          "<script>alert('서버 오류입니다.');history.go(-1);</script>"
        );
      if (rows.length == 0) {
        return res.send(
          "<script>alert('아이디 혹은 비밀번호가 틀립니다.');history.go(-1);</script>"
        );
      }
      let salt = rows[0].salt;
      let iv = rows[0].iv;
      let encBCKey = rows[0].encBCKey;
      let BCKey = "";
      try {
        let key = crypto
          .createHash("sha256")
          .update(req.body.LoginPasswd + salt)
          .digest("byte");
        let decipher = crypto.createDecipheriv(
          "aes-256-cbc",
          key,
          Buffer.from(iv, "base64")
        );
        BCKey = decipher.update(encBCKey, "base64", "utf8");
        BCKey += decipher.final("utf8");
      } catch {
        return res.send(
          "<script>alert('아이디 혹은 비밀번호가 틀립니다.');history.go(-1);</script>"
        );
      }
      //console.log(BCKey);
      req.session.id = rows[0].id;
      req.session.name = rows[0].name;
      req.session.address = rows[0].address;
      req.session.BCKey = BCKey;
      console.log(req.session);
      return res.send("<script>location.href='./index'</script>");
    }
  );
});

// LoginId, LoginPasswd

module.exports = router;
