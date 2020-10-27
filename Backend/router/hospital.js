const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");
const request = require("request-promise-native");

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

send_sms = (phoneNumber, number) => {
    const NCP_accessKey = "amEhhOZJIVwfNNMu1My6";          
  
        // access key id (from portal or sub account)
    const NCP_secretKey = "xSmNIV9qsku9MqQy7ek67OUzUJxxUlTjgXn14MqY";           
  
        // secret key (from portal or sub account)
    const NCP_serviceID = "ncp:sms:kr:260833819066:block";
  
        // sens serviceID
    const myPhoneNumber = "01049556397";
  
    const space = " ";          // one space
    const newLine = "\n";           // new line
    const method = "POST";          // method
  
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${NCP_serviceID}/messages`;  
  
        // url (include query string)
    const url2 = `/sms/v2/services/${NCP_serviceID}/messages`;
  
    const timestamp = Date.now().toString();         // current timestamp (epoch)
    let message = [];
    let hmac=crypto.createHmac('sha256',NCP_secretKey);
  
    message.push(method);
    message.push(space);
    message.push(url2);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(NCP_accessKey);
    const signature = hmac.update(message.join('')).digest('base64');
  
    request({
        method: method,
        json: true,
        uri: url,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-ncp-iam-access-key' : NCP_accessKey,
            'x-ncp-apigw-timestamp': timestamp,
            'x-ncp-apigw-signature-v2': signature.toString()
        },
        body: {
            "type":"SMS",
            "contentType":"COMM",
            "countryCode":"82",
            "from": myPhoneNumber,
            "content": number,
            "messages":[
                {
                    "to":`${phoneNumber}`,
                }
            ]
        }
    });
  }

isHospital = (userid) => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT isHospital FROM user WHERE id=?", [userid], (err, rows, fields) => {
            if(err) return resolve(false);
            if(!rows || rows.length == 0) return resolve(false);
            if(rows[0].isHospital != 1) return resolve(false);
            return resolve(true);
        })
    });
}

router.get("/", (req, res) => {
    isHospital(req.session.userid)
    .then((result) => {
        if(!result) return res.status(403).json();
        conn.query("SELECT * FROM user", [], (err, rows, fields) => {
            if(err) return res.status(500).json();
            res.render("hospital", {user: rows});
        })
    })
})

// POST userid, count
router.post("/", (req, res) => {
    console.log(req.body)
    isHospital(req.session.userid)
    .then((result) => {
        if(!result) return res.status(403).json();
        if (!req.body.userid || !req.body.count) {
            return res.send("<script>alert('빈칸이 있습니다.');history.go(-1);</script>")
        }
        conn.query("SELECT address, BCKey FROM user WHERE id=?", [req.body.userid], (err, rows, fields) => {
            if(rows.length == 0) {
                return res.send("<script>alert('없는 이메일 입니다.');history.go(-1);</script>")
            }
            let address = rows[0].address;
            let BCKey = rows[0].BCKey;
            web3.getCertByOwner(address, address)
            .then((result) => {
                console.log(result)
                getBloodCerts(address, result)
                .then((bloodCerts) => {
                    let a = []
                    let b = []
                    for(let i = 0;i < bloodCerts.length;i++) {
                        console.log(bloodCerts[i]);
                        if(bloodCerts[i].used == 0) {
                            a.push(result[i]);
                            b.push(bloodCerts[i])
                            if(a.length >= req.body.count) {
                                break;
                            }
                        }
                    }
                    if(a.length < req.body.count) {
                        return res.send("<script>alert('헌혈증이 부족합니다.');history.go(-1);</script>");
                    }
                    web3.unlockAccount(address, BCKey)
                    .then(() => {
                        (async () => {
                            for(let i = 0;i < req.body.count;i++) {
                                await web3.use(address, a[i])
                            }
                        })()
                    })
                })
            })
        })
    })
});

module.exports = router;
