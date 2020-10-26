const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");
const { getBloodCerts } = require("../web3/web3");

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
    res.render("mypage");
})

module.exports = router;