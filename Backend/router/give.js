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
                return res.send("<script>alert('헌혈증이 부족합니다.');history.go(-1);</script>");
            }
            conn.query("SELECT * FROM user WHERE id=?", [req.body.to], (err, rows, fields) => {
                if(rows.length == 0) {
                    return res.send("<script>alert('없는 아이디 입니다.');location.href='/';<script>");
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
                            conn.query("SELECT * FROM phone WHERE id=? AND isActive=1", [req.body.to], (err, rows, fields) => {
                                if(rows.length != 0) {
                                    send_sms(rows[0].phone, "헌혈증이 도착했습니다.")
                                }
                            })
                            return res.send("<script>alert('기부 성공했습니다.');location.href='/';</script>")
                        })();
                    })
                })
            });
        })
        .catch(console.error);
    })
})

module.exports = router;
