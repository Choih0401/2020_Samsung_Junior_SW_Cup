const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");

db.connect(conn);

router.post("/", (req, res) => {
  if (
    !req.body.RegisterId ||
    !req.body.RegisterPasswd ||
    !req.body.username ||
    !req.body.resident
  ) {
    return res.send(
      "<script>alert('빈칸이 있습니다.');history.go(-1);</script>"
    );
  }
  conn.query(
    "SELECT * FROM user WHERE id=?",
    [req.body.RegisterId],
    (err, rows, fields) => {
      if (err)
        return res.send(
          "<script>alert('서버 오류입니다.');history.go(-1);</script>"
        );
      if (rows.length > 0) {
        return res.send(
          "<script>alert('중복된 아이디입니다.');history.go(-1);</script>"
        );
      }
      let BCKey = crypto.randomBytes(16).toString("base64");
      web3.createAccount(BCKey).then((addr) => {
        web3.giveCoin(addr);
        let salt = crypto.randomBytes(8).toString("base64");
        let key = crypto
          .createHash("sha256")
          .update(req.body.RegisterPasswd + salt)
          .digest("byte");
        let iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        let encBCKey = cipher.update(BCKey, "utf8", "base64");
        encBCKey += cipher.final("base64");

        conn.query(
          "INSERT INTO user (id, name, resident, salt, iv, encBCKey, address, isAdmin, BCKey) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
          [
            req.body.RegisterId,
            req.body.username,
            req.body.resident,
            salt,
            iv.toString("base64"),
            encBCKey,
            addr,
            BCKey
          ],
          (err, rows, fields) => {
            if (err)
              return res.send(
                "<script>alert('서버 오류입니다.');history.go(-1);</script>"
              );
            return res.send(
              "<script>alert('회원가입이 완료되었습니다.');location.href='./login';</script>"
            );
          }
        );
      });
    }
  );
});

// RegisterId, RegisterPasswd, username, resident

module.exports = router;
