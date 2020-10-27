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

router.get("/", (req, res) => {
  res.send("<script>location.href='/index/1';</script>")
})

router.get("/:num", (req, res) => {
  web3
    .getCertByOwner(req.session.address, req.session.address)
    .then((result) => {
      console.log(result)
      getBloodCerts(req.session.address, result)
        .then((bloodCerts) => {
          conn.query("SELECT COUNT(*) AS num FROM user", [], (err, rows, fields) => {
            conn.query("SELECT num, title, name FROM board ORDER BY num DESC", [], (err, row, fields) => {
              if(err) return res.status(500).json();
              bloodCerts = bloodCerts || [];
              console.log("헌혈증: ", bloodCerts);
              console.log("이름: " + req.session.name);
              console.log("개수: " + bloodCerts.length);
              res.render("index", {
                bloodCerts: bloodCerts,
                name: req.session.name,
                page: req.params.num,
                board: row,
                num: rows[0].num
              });
            })
          })
        })
        .catch(console.error);
    });
});

module.exports = router;
