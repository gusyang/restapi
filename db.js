'use strict'
const sql = require("mssql");
const conf = require("./conf.json");

const poolPromise = new sql.ConnectionPool(conf.sqloption)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
    sql, poolPromise
};