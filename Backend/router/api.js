const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const multer = require("multer")
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");
const path = require("path")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads")
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  }
})
const upload = multer({
  storage: storage,
}).single("img");

db.connect(conn);

authCheck = (req) => {
  if (!req.session.userid) {
    return false;
  } else {
    return true;
  }
}

router.get("/test", (req, res) => {
  web3.unlockAccount(req.session.address, req.session.BCKey)
  .then(() => {
    web3.use(req.session.address, "1")
  });
});

router.post("/board", upload, (req, res) => {
  req.body.title, req.body.content
  if(!req.body.title || !req.body.content) {
    return res.json({success: false});
  }
  if(req.file) {
    conn.query("INSERT INTO board (id, name, title, content, img, active) VALUES (?, ?, ?, ?, ?, 1)", [req.session.userid, req.session.name, req.body.title, req.body.content, req.file.filename], (err, rows, fields) => {
      if(err) return res.status(500).json({success: false, err: 1});
      return res.status(200).json({success: true})
    })
  } else {
    conn.query("INSERT INTO board (id, name, title, content, active) VALUES (?, ?, ?, ?, 1)", [req.session.userid, req.session.name, req.body.title, req.body.content], (err, rows, fields) => {
      if(err) return res.status(500).json({success: false, err: 1});
      res.redirect('/');
      //return res.status(200).json({success: true})
    })
  }
})

router.get("/board/:num", (req, res) => {
  if(isNaN(req.params.num)) {
    return res.status(400).json();
  }
  conn.query("SELECT * FROM board WHERE num=?", [req.params.num], (err, rows, fields) => {
    if(rows.length == 0) {
      return res.status(404).json();
    }
    console.log(rows[0])
    conn.query("SELECT COUNT(*) AS num FROM user", [], (err, row, fields) => {
      res.render('read', {board: rows[0], usercookie: req.cookies.user, num: row[0].num});
    })
    //return res.status(200).json(rows[0]);
  })
})

router.get("/board", (req, res) => {
  conn.query("SELECT num, name, title FROM board", [], (err, rows, fields) => {
    return res.status(200).json(rows);
  })
})

// router.post("/register", (req, res) => {
//   if (!req.body.id || !req.body.pw) {
//     res.json({ success: false });
//   }
//   conn.query(
//     "SELECT * FROM user WHERE id=?",
//     [req.body.id],
//     (err, rows, fields) => {
//       if (err) return res.status(500).json({ err: "1" });
//       if (rows.length > 0) {
//         return res.json({ success: false });
//       }
//       let BCKey = crypto.randomBytes(16).toString("base64");
//       web3.createAccount(BCKey).then((addr) => {
//         web3.giveCoin(addr);
//         let salt = crypto.randomBytes(8).toString("base64");
//         let key = crypto
//           .createHash("sha256")
//           .update(req.body.pw + salt)
//           .digest("byte");
//         let iv = crypto.randomBytes(16);
//         let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//         let encBCKey = cipher.update(BCKey, "utf8", "base64");
//         encBCKey += cipher.final("base64");

//         conn.query(
//           "INSERT INTO user (id, salt, iv, encBCKey, address) VALUES (?, ?, ?, ?, ?)",
//           [req.body.id, salt, iv.toString("base64"), encBCKey, addr],
//           (err, rows, fields) => {
//             if (err) return res.status(500).json({ err: "2" });
//             return res.json({ success: true });
//           }
//         );
//       });
//     }
//   );
// });

// router.post("/login", (req, res) => {
//   if (!req.body.id || !req.body.pw) {
//     res.json({ success: false });
//   }
//   conn.query(
//     "SELECT id, salt, iv, encBCKey FROM user WHERE id=?",
//     [req.body.id],
//     (err, rows, fields) => {
//       if (err) return res.status(500).json({ err: "1" });
//       if (rows.length == 0) {
//         return res.json({ success: false });
//       }
//       let salt = rows[0].salt;
//       let iv = rows[0].iv;
//       let encBCKey = rows[0].encBCKey;
//       let BCKey = "";
//       try {
//         let key = crypto
//           .createHash("sha256")
//           .update(req.body.pw + salt)
//           .digest("byte");
//         let decipher = crypto.createDecipheriv(
//           "aes-256-cbc",
//           key,
//           Buffer.from(iv, "base64")
//         );
//         BCKey = decipher.update(encBCKey, "base64", "utf8");
//         BCKey += decipher.final("utf8");
//       } catch {
//         return res.status(401).json({ success: false }); // pw wrong
//       }
//       console.log(BCKey);
//       return res.json({ success: true });
//     }
//   );
// });

module.exports = router;
