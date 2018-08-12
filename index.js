'use strict'
const express = require("express") ;
const conf = require("./conf.json");
const encrypt = require("./encrypt");
const { sql, poolPromise} = require("./db");
const bodyparser = require("body-parser"); 
const log4js = require("log4js");
const fs = require("fs");
const isemail = require("isemail");

const app = express();

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

log4js.configure(conf.logconf);
const logger = log4js.getLogger();

const logpath = judgePath("./logs");

function judgePath(pathStr) {
    if (!fs.existsSync(pathStr)) {
        fs.mkdirSync(pathStr);
        logger.info("createPath: " + pathStr);
    }
}
//heart beat
app.get("/faq",(req,res) =>{
    res.send("-newegg-"); 
});

//check email
app.get("/api/email/:email", async (req,res) => {
    const countrycode = "USA";
    let isencrypt = false;
    let email = req.params.email;
    //if encrypt email, decrypt first
    if(email.indexOf("@") === -1){
        email = encrypt.decrypt(email);
        isencrypt = true;
    }
    //if not email, return
    if (!isemail.validate(email, { minDomainAtoms: 2 })){
        let msg = `invalidate email. Request email: ${email} `;
        res.json({
            "code":5011,
            "message":msg
        });
        if (isencrypt) {
            msg += ` Request string: ${req.params.email}`;
        }
        logger.error(msg);
        return;
    }
    //check if email exists in our database
    try{
        const pool = await poolPromise;
        const result = await pool.request()
            .input("email", sql.VarChar(128), email)
            .input("countrycode", sql.Char(3), countrycode)
            .query(conf.sqlemailquery);
        if (result.rowsAffected[0] === 0){
            res.json({
                "code":1000,
                "message":`Email Address ${email} doesn't find. New Email.`
                });
            logger.info(`Email Address ${email} doesn't find. New Email.`);
          
        }else if(result.rowsAffected[0] === 1){            
            if (result.recordset[0].Enable === 'Y'){
                res.json({
                    "code": 1001,
                    "message": `Email Address ${email} found. Subscribed Email.`
                });
                logger.info(`Email Address ${email} found. Subscribed Email.`);              
            }else{
                res.json({
                    "code": 1002,
                    "message": `Email Address ${email} found. Unsubscribed Email.`
                });
                logger.info(`Email Address ${email} found. Unsubscribed Email.`);              
            }
        }
    } catch (err) {
        res.status(500);
        res.json({
            "code":5012,
            "message":"Server Error, Please contact API owner."
            });
        logger.error(err.message);
    }
});

//opt-in
app.post("/api/optin", async (req,res) => {
    const reqBody = req.body;
    let isencrypt = false;
    let email = reqBody.email;
    const source = reqBody.source === undefined ? "CertainSource" : reqBody.source;

    if (email.indexOf("@") === -1) {
        email = encrypt.decrypt(email);;
        isencrypt = true;
    }
    //if not email, return
    if (!isemail.validate(email, { minDomainAtoms: 2 })) {
        let msg = `invalidate email. Request email: ${email} `;
        res.json({
            "code": 5021,
            "message": msg
        });
        if (isencrypt) {
            msg += ` Request string: ${req.params.email}`;
        }
        logger.error(msg);
        return;
    }
    //insert to table
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("email", sql.VarChar(128), email)
            .input("nickname", sql.NVarChar(80), reqBody.firstname + " " + reqBody.lastname)
            .input("source", sql.Char(50), source)
            .query(conf.sqloptin);
        if (result.rowsAffected[0] === 1) {
            res.json({
                "code": 2000,
                "message": `Email Address ${email} insert success!`
            });            
            logger.info(`Email Address ${email} insert success!`);    
        } else {
            res.json({
                "code": 2001,
                "message": `Email Address ${email} insert fail,email exists!`
            });
            logger.error(`Email Address ${email} insert fail, email exists!`);  
        }        
    } catch(err){
        res.status(500);
        res.json({
            "code": 5022,
            "message": "Server Error, Please contact API owner."
        });
        logger.error(err.message);
    }
});
//encrypt
app.get("/api/encrypt/:email",(req,res) =>{
    const text = req.params.email || "";   
    res.removeHeader("X-Powered-By");
    try{
        res.send(encrypt.encrypt(text));
    }catch(error){
        res.status(500);
        res.json({
            "code": 5031,
            "message": "Server Error, Please contact API owner."
        });
        logger.error(err.message);
    }
});

//decrypt
app.get("/api/decrypt/:encryptstr",(req,res) =>{
    const text = req.params.encryptstr || "";   
    try {
        res.send(encrypt.decrypt(text));
    } catch (error) {
        res.status(500);
        res.json({
            "code": 5041,
            "message": "Server Error, Please contact API owner."
        });
        logger.error(err.message);
    }
});
const port = process.env.PORT||3000;
app.listen(port,() => {
    console.log(`Listen on port ${port}....`);
});