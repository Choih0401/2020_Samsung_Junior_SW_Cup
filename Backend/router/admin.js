const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");
const request = require("request-promise-native");

db.connect(conn);

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
            "content":`${number}`,
            "messages":[
                {
                    "to":`${phoneNumber}`,
                }
            ]
        }
    });
  }

isAdmin = (userid) => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT isAdmin FROM user WHERE id=?", [userid], (err, rows, fields) => {
            if(err) return resolve(false);
            if(!rows || rows.length == 0) return resolve(false);
            if(rows[0].isAdmin != 1) return resolve(false);
            return resolve(true);
        })
    });
}

router.get("/", (req, res) => {
    isAdmin(req.session.userid)
    .then((result) => {
        if(!result) return res.status(403).json();
        conn.query("SELECT * FROM user", [], (err, rows, fields) => {
            if(err) return res.status(500).json();
            res.render("admin", {user: rows});
        })
    })
})

// POST donateDate, birth, gender, name, kind, userid
router.post("/", (req, res) => {
    console.log(req.body)
    isAdmin(req.session.userid)
    .then((result) => {
        if(!result) return res.status(403).json();

        try {
            req.body.donateDate = new Date(req.body.donateDate).getTime() / 1000;
            req.body.birth = new Date(req.body.birth).getTime() / 1000;
        } catch {
            return res.status(400).json();
        }

        if(isNaN(req.body.donateDate) || isNaN(req.body.birth) || isNaN(req.body.gender)) {
            return res.status(400).json();
        }

        conn.query("SELECT * FROM user WHERE id=?", [req.body.userid], (err, rows, fields) => {
            if(err) return res.status(500).json();
            if(!rows || rows.length == 0) return res.status(404).json();
            web3.unlockAccount(rows[0].address, rows[0].BCKey)
            .then(() => {
                web3.createCert(rows[0].address, req.body.donateDate, req.body.birth, req.body.gender, req.body.name, req.body.kind)
                .then(() => {
                    conn.query("SELECT * FROM phone WHERE id=? AND isActive=1", [req.body.userid], (err, rows, fields) => {
                        if(rows.length != 0) {
                            send_sms(rows[0].phone, "헌혈증이 생성되었습니다.")
                        }
                    })
                    return res.send("<script>alert('추가 성공');history.go(-1);</script>")
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).json();
                })
            })
        })
        // web3.unlockAccount(req.session.address, req.session.BCKey)
        // .then(() => {
        //     web3.createCert(req.session.address, req.body.donateDate, req.body.birth, req.body.gender, req.body.name, req.body.kind)
        //     .then(() => {
        //         web3.getCertByOwner(req.session.address, req.session.address)
        //         .then((result) => {
        //             if(!result || result.length == 0) return res.status(500).json({err: "asdf"});
        //             web3.transfer(req.session.address, req.body.to, result[result.length - 1])
        //             .then(() => {
        //                 return res.status(200).json();
        //             })
        //         })
        //     })
        //     .catch(() => {
        //         return res.status(500).json({err: true});
        //     })
        // })
        // .catch(() => {
        //     return res.status(500).json();
        // })
    })
});

module.exports = router;
