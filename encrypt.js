'use strict'
const conf = require("./conf.json");
const crypto = require("crypto");

exports.encrypt = (text) => {
    var cipher = crypto.createCipher(conf.algorithm, conf.seckey);
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
};

exports.decrypt = (text) =>{
    var decipher = crypto.createDecipher(conf.algorithm, conf.seckey)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
};