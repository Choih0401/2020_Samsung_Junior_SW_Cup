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
      Object.assign(await web3.getBloodCerts(address, result[i]), { num: i })
    );
  }
  console.log(bloodCerts);
};

router.get("/", (req, res) => {
  web3
    .getCertByOwner(req.session.address, req.session.address)
    .then((result) => {
      getBloodCerts(req.session.address, result)
        .then((bloodCerts) => {
          bloodCerts = bloodCerts || [];
          console.log("헌혈증: ", bloodCerts);
          console.log("이름: " + req.session.name);
          console.log("개수: " + bloodCerts.length);
          res.render("index", {
            bloodCerts: bloodCerts,
            name: req.session.name,
          });
        })
        .catch(console.error);
    });
});

module.exports = router;
