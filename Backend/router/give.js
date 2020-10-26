const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");

db.connect(conn);

getBloodCerts = async (address, result) => {
  let bloodCerts = [];
  for (let i = 0; i < result.length; i++) {
    bloodCerts = bloodCerts.concat(
      Object.assign(await web3.getBloodCerts(address, result[i]), {
        num: result[i],
      })
    );
  }
  console.log(bloodCerts);
  return bloodCerts;
};

// num, to
router.post("/", (req, res) => {
  if(isNaN(req.body.num) || req.body.num <= 0 || !req.body.to) {
      return res.status(400).json();
  }
  web3
    .getCertByOwner(req.session.address, req.session.address)
    .then((result) => {
      console.log(result)
      if(result.length < req.body.num) {
          return res.send("<script>alert('초과')</script>");
      }
      conn.query("SELECT * FROM user WHERE id=?", [req.body.to], (err, rows, fields) => {
          if(rows.length == 0) {
              return res.send("<script>alert('없는아이디')<script>");
          }
          web3.unlockAccount(req.session.address, req.session.BCKey)
            .then(() => {
            (async () => {
                for(let i = 0;i < req.body.num;i++) {
                    await web3.transfer(req.session.address, rows[0].address, result[i]);
                }
                return res.send("<script>alert('success')</script>")
            })();
        });
      })
    //   getBloodCerts(req.session.address, result)
    //     .then((bloodCerts) => {
    //       conn.query("SELECT num, title, name FROM board ORDER BY num DESC", [], (err, rows, fields) => {
    //         if(err) return res.status(500).json();
    //         bloodCerts = bloodCerts || [];
    //         console.log("헌혈증: ", bloodCerts);
    //         console.log("이름: " + req.session.name);
    //         console.log("개수: " + bloodCerts.length);
    //         res.render("index", {
    //           bloodCerts: bloodCerts,
    //           name: req.session.name,
    //           page: req.params.num,
    //           board: rows
    //         });
    //       })
    //     })
    //     .catch(console.error);
    });
})

module.exports = router;
