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
         getBloodCerts(req.session.address, result)
        .then((bloodCerts) => {
            let a = []
            let b = []
            for(let i = 0;i < bloodCerts.length;i++) {
                console.log(bloodCerts[i]);
                if(bloodCerts[i].used == 0) {
                    a.push(result[i]);
                    b.push(bloodCerts[i])
                    if(a.length >= req.body.num) {
                        break;
                    }
                }
            }
            if(a.length < req.body.num) {
                return res.send("<script>alert('초과')</script>");
            }
            conn.query("SELECT * FROM user WHERE id=?", [req.body.to], (err, rows, fields) => {
                if(rows.length == 0) {
                    return res.send("<script>alert('없는아이디')<script>");
                }
                web3.unlockAccount(req.session.address, req.session.BCKey)
                .then(() => {
                    web3.unlockAccount(rows[0].address, rows[0].BCKey)
                    .then(() => {
                        (async () => {
                            for(let i = 0;i < req.body.num;i++) {
                                await web3.createCert(rows[0].address, b[i].donateDate, b[i].birth, b[i].gender, b[i].name, b[i].kind)
                                await web3.use(req.session.address, a[i])
                            }
                            return res.send("<script>alert('success')</script>")
                        })();
                    })
                })
            });
        })
        .catch(console.error);
    })
})

module.exports = router;
