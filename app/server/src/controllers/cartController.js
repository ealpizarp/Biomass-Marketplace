const {redisClient, mongoCli, my_sql_conn, neo4jdriver} = require("../../public/db");
const redis = require('redis');
const e = require("express");
const { int } = require("neo4j-driver");
const factura = require("../middleware/factura");
const cartCtrl = {};



cartCtrl.fetch_cart = async(req, res) => {
    try {
        user = req.params.user;
        console.log(user);
        redisClient.hgetall(user, (err, results) =>{
            if(results){
                res.send(results);
            }else{
                res.send(err);
            }
        });
        
    } catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred fetching cart'
        })
    }
}

cartCtrl.addItem = async(req, res) => {
    try {
        const {user, item, amount} = req.body;
        redisClient.hincrby(user, item, amount, redis.print);
        redisClient.hgetall(user, (err, results) =>{
            if(results){
                res.send(results);
            }else{
                res.send(err);
            }
        });
    } catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred fetching cart'
        })
    }
}

cartCtrl.removeItem = async(req, res) => {
    try {
        const {user, item} = req.body;
        redisClient.hdel(user, item);
        redisClient.hgetall(user, (err, results) =>{
            if(!err){
                res.send(results);
            }else{
                res.send(err);
            }
        });
    } catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred fetching cart'
        })
    }
}

cartCtrl.finishShopping = async(req, res) => {
    try {
        const {user, items, total, ordenPublica} = req.body;
        var fac = new factura();
        fac.client = user; 
        fac.items = items;       
        fac.total = total;
        fac.publica = ordenPublica;
        const num_items = items.length;
        console.log(num_items);
        for (var i = 0; i < num_items; i++) {

            my_sql_conn.query('UPDATE Producto SET inventario_producto = inventario_producto - ? WHERE id_producto =  ?',[items[i].cantidad, items[i].id_producto], 
            (error, results, fields) => {
                if (error) throw error;
                console.log(results.message);
            })
            const neo4jSession = neo4jdriver.session();
            neo4jSession.run(`MATCH (u:Usuario{username:$username_value}),(p:Producto{id_mysql:$product_id_value}) MERGE (u)-[r:COMPRO]->(p) RETURN TYPE(r)`,
            {username_value: user, product_id_value: items[i].id_producto}).then(
                result => {
                    console.log(result.summary.counters);
                }
            ).catch(err => {
                return res.send('Error ocurred:' + err);
            })
        }

        console.log(items);

        fac.save((err, doc) =>{
            if(!err){
                return res.json({
                    msg: 'Successful'
                });
            }else{
                console.log("Error de insercion");
            }
        });
        redisClient.del(user);
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: 'Error occurred finishing purchase'
        })
    }
}

cartCtrl.getBills = async(req, res) => {
    try{
        const user = req.params.username;
        await factura.find({client: user}, function(err,data){
            if(!err){
                console.log(data, data.length);
                return res.json(data);
            }else{
                console.log(err);
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: 'Error occurred finding purchase'
        })
    }
}


module.exports = cartCtrl;