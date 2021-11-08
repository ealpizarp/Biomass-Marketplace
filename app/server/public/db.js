const mongoose = require("mongoose");
const neo4j = require('neo4j-driver');

//NEO
const neo_uri = 'bolt://localhost:7687'
const neo4jdriver = neo4j.driver(neo_uri, neo4j.auth.basic('neo4j', 'password'));

//REDIS
const redisConf = {
    host: '127.0.0.1',  
    port: '6379',
    pass: 'adminpass'
};   

var redisClient = require('redis').createClient(redisConf.port, redisConf.host);
redisClient.auth('adminpass');

redisClient.on('connect', function() {
    console.log('REDIS IS CONNECTED');
});

//MONGO
try {
mongoCli = mongoose.createConnection(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
}) }
catch(err) {
    console.log(err);
    }


//MySQL
const mysql = require('mysql');
const my_sql_conn = mysql.createPool({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : 'password',
    database : 'DB2_PR'
});


module.exports = {neo4jdriver, redisClient, mongoCli, my_sql_conn}