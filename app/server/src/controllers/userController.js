const upload = require("../middleware/upload");
const download = require("../middleware/download");
const {neo4jdriver, my_sql_conn} = require("../../public/db");
const factura = require("../middleware/factura");
const e = require("express");
const bcrypt = require('bcrypt');
const { query } = require("express");

const userCtrl = {};

userCtrl.upload = async(req, res) =>{
    try {

        console.log(req);
        await upload(req, res);
        console.log(req.file);
        if (req.file == undefined) {
            return res.send(`You must select a file.`);
        } else {
            return res.send(req.file.filename);
        }
        //return res.send(`File has been uploaded.`);
        //return next();
    } catch (error) {
        console.log(error);
        return res.send(`Error when trying upload image: ${error}`);
    }
}

userCtrl.download = async(req,res,next) => {
    try {
        await download(req, res, next);
        console.log('Fetched Image' + res)
    } catch (error) {
        console.log(error);
        return res.send(`Error when downloading image: ${error}`);
    }
}

userCtrl.login = async(req, res) => {
    try {
        const { username, password } = req.body;

        const query = 'SELECT username_usuario, password_usuario, tipo_usuario FROM Usuario WHERE username_usuario = ?';
        const cannot_verify_msg = 'Cannot verify user, please enter a valid username and password';
        my_sql_conn.query(query,[username], function (error, results, fields) {
            if (error) throw error;
        if(results.length != 0){

            const tipo_usuario_value = results[0].tipo_usuario != 1 ? "user" : "admin";
            
            bcrypt.compare(password, results[0].password_usuario).then(function(result){
                return result ? res.send(JSON.stringify({tipo_usuario: tipo_usuario_value})) : res.send(cannot_verify_msg);
            });
        }
        else {
            return res.send(cannot_verify_msg);
        }
        });
    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred while trying to verify user'
        })
    }
}


userCtrl.fetch_user_info = async (req, res) => {

    try {

    const query = `SELECT username_usuario, nombre_completo_usuario, fecha_nacimiento, 
    tipo_usuario, id_foto_usuario FROM Usuario WHERE username_usuario = ?;`

    my_sql_conn.query(query,[req.params.username], function (error, results, fields) {
        if (error) throw error;

    if(results.length != 0){

        const tipo_usuario_parsed = (results[0].tipo_usuario === 1) ? 'Admin' : 'User';

        const producto = {

        username: results[0].username_usuario,
        nombre_completo: results[0].nombre_completo_usuario,
        fecha_nacimiento: results[0].fecha_nacimiento,
        tipo_usuario: tipo_usuario_parsed,
        id_foto_usuario: results[0].id_foto_usuario

        }

        return res.send(JSON.stringify(producto))
    }
    else {
        
        return res.send('Cannot find user with the given id');
    }

    });
}
catch(err) {
    console.log(err)
    return res.status(400).jason({
        msg: 'Error ocurred while getting the user info from database'
    })
}
}

userCtrl.register_user = async (req, res) => {
    try {

        const {username, password, whole_name, birth_date, user_type} = req.body;

        my_sql_conn.query('SELECT username_usuario FROM Usuario WHERE username_usuario = ?',[username], function (error, results, fields) {
            if (error) throw error;
        if(results.length != 0){
            return res.send('Username already registrated in database');
            }
        else {

            const saltRounds = 10;
            const sql_querry = 'INSERT INTO Usuario VALUES (?,?,?,?,?,?,?)';

            bcrypt.genSalt(saltRounds, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {

                    my_sql_conn.query(sql_querry, [username, whole_name, hash, birth_date, 
                        salt, user_type, '1618877755364-user.png'], function (error, results, fields) {
                        if (error) throw error;
                        console.log(results);
                    });
                    const neo4jSession = neo4jdriver.session();
                    neo4jSession.run('MERGE(u:Usuario{username:$username_value}) RETURN u', { username_value: username }).then(
                        result => {
                            const singleRecord = result.records[0];
                            const node = singleRecord._fields[0];
                    
                            console.log('Succesfully created ' + node.properties.username + ' node in Neo4j');

                            return res.send('User registrated succesfully!');

                        }).catch(err => {
                            return res.send('Error ocurred:' + err);
                        })
                });
            }); 
        }
        });
    } 
    catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred during user registration'
        })
    }
}


userCtrl.update_user = async (req, res) => {

    const { username, password, whole_name, birth_date, user_type } = req.body

    try {

        if (password != null) {

            const saltRounds = 10;

            bcrypt.genSalt(saltRounds, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    
                    my_sql_conn.query(`UPDATE Usuario SET nombre_completo_usuario = COALESCE(?, nombre_completo_usuario), password_usuario = COALESCE(?,password_usuario),
                    fecha_nacimiento = COALESCE(?,fecha_nacimiento), salt_usuario = COALESCE(?,salt_usuario), tipo_usuario = COALESCE(?,tipo_usuario) 
                    WHERE username_usuario =  ?`,[whole_name,hash,birth_date,salt,user_type, username], (error, results, fields) => {
                        if (error) throw error;
                        console.log(results.message);
                        return res.send('User updated successfully')
                    })
                });

            });

        } else {

            my_sql_conn.query(`UPDATE Usuario SET nombre_completo_usuario = COALESCE(?, nombre_completo_usuario), fecha_nacimiento = COALESCE(?,fecha_nacimiento),
            tipo_usuario = COALESCE(?,tipo_usuario) WHERE username_usuario =  ?`,
            [whole_name,birth_date,user_type, username], (error, results, fields) => {
                        if (error) throw error;
                        console.log(results.message);
                        return res.send('User updated successfully')
                    })
        }
    } catch(err) {
    console.log(err)
    return res.status(400).jason({
        msg: 'Error ocurred while trying to update user'
    })
}
}

userCtrl.change_profile_pic = async (req, res) => {
    try {

    const {username, filename} = req.body;

    my_sql_conn.query('UPDATE Usuario SET id_foto_usuario = ? WHERE username_usuario = ?', [filename, username], (error, results, fields) => {
        if (error) throw error;
        console.log(results.message);
        return res.send('Succesfully updated user profile picture filename');
    });

} catch(err) {
    console.log(err)
    return res.status(400).jason({
        msg: 'Error ocurred during user registration'
    })
}
}


userCtrl.comentar_producto = async (req, res) => {

    const { username, product_id, comentario} = req.body;
    const neo4jSession = neo4jdriver.session();
    neo4jSession.run(`MATCH (u:Usuario{username:$username_value}),(p:Producto{id_mysql:$id_mysql_value}) MERGE 
    (u)-[r:COMENTA_A]->(p) ON CREATE SET r.comentario = $comentario_value ON MATCH SET r.comentario = $comentario_value RETURN TYPE(r)`, 
    { 
        username_value: username,
        id_mysql_value: product_id,
        comentario_value: comentario

    }).then(
        result => {
            const singleRecord = result.records[0];

            console.log('Relationship of type ' + singleRecord._fields[0] + ' created succesfully');

            return res.send('User comment succesfully registered')

        }).catch(err => {
            return res.send('Error ocurred trying to register user comment:' + err);
        })
}


userCtrl.delete_user_comment = async (req, res) => {

    try {
        const neo4jSession = neo4jdriver.session();
        neo4jSession.run('MATCH(u:Usuario{username:$username_value}) - [r:COMENTA_A] -> (p:Producto{id_mysql:$id_mysql_value})  DELETE r',
        {username_value: req.params.username, id_mysql_value: req.params.product_id}).then(
            result => {
                console.log(result.summary.counters);
                return res.send('User commente deleted succesfully!')
            }).catch(err => {
                return res.send('Error ocurred during user comment deletion:' + err);
        })

    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error while trying to delete user comment'
        })
    }
}

userCtrl.user_recommendations = async (req, res) => {

    try {

        const user = req.params.username;
        await factura.find({client: user}, function(err,data){

            if(!err){

                    if (data.length != 0) {

                        const neo4jSession = neo4jdriver.session();

                        neo4jSession.run(`MATCH (pr:Producto) <- [:COMPRO] - (u:Usuario) - [:COMPRO] -> 
                        (p:Producto{id_mysql:$id_mysql_value}) WHERE NOT u.username = $username_value RETURN DISTINCT pr.nombre AS nombre, 
                        pr.precio AS precio, pr.id_mysql AS id_mysql, pr.main_image as main_image LIMIT 5`,
                         {id_mysql_value: data[data.length - 1].items[0].id_producto, username_value: req.params.username}).then(
                            result => {
                                let recommendations = [];
                                result.records.forEach(record => {
                                    recommendations.push( {
                                        nombre: record.get('nombre'),
                                        precio: record.get('precio'),
                                        id_mysql: record.get('id_mysql'),
                                        main_image: record.get('main_image')
                                    });
                                });

                                return res.send(JSON.stringify(recommendations));
                                
                        }).catch(err => {
                            return res.send('Error ocurred:' + err);
                        })
                    }
                    else {
                        return res.send('The user has no recommendations');
                    }
            }else{
                console.log(err);
            }
        });
        
    } catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred fetching user recommendations'
        })
    }
}

userCtrl.fetch_public_orders = async (req, res) => {

        try{
            const user = req.params.username;
            await factura.find({client: user, publica:true}, (err,data) => {
                if(!err){
                    console.log(data, data.length)
                    return res.json(data);
                }else{
                    console.log(err);
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                msg: 'Error occurred fetching user purchases'
            })
    }

}


userCtrl.follow_user = (req, res) => {

    try {

        const {username_a, username_b} = req.body;

        const neo4jSession = neo4jdriver.session();

        neo4jSession.run('MATCH (a:Usuario{username:$user_a}), (b:Usuario{username:$user_b}) MERGE (a) - [r:SIGUE_A] -> (b) RETURN TYPE(r)',
        {
            user_a: username_a,
            user_b: username_b

        }).then(

            result => {
            console.log(result.summary.counters);
            return res.send('User following relationship processed succesfully!')

            }).catch(err => {
                return res.send('Error ocurred during user follow relatipnship:' + err);
        })

    } catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred while adding follow request'
        })
    }
}

userCtrl.fetch_all_users = (req, res) => {

    try {

    const neo4jSession = neo4jdriver.session();

    neo4jSession.run(`MATCH(u:Usuario) RETURN u.username AS username`).then(
        result => {
            let users = [];
            result.records.forEach(record => {
                users.push( {
                    username: record.get('username'),
                });
            });

            return res.send(JSON.stringify(users));
            
    }).catch(err => {
        return res.send('Error ocurred:' + err);
    })

} catch(err) {
    console.log(err);
    return res.status(400).jason({
        msg: 'Error occurred fetching users'
    })
}

}

userCtrl.fetch_followed_users = (req, res) => {

    try {

    const neo4jSession = neo4jdriver.session();

    neo4jSession.run(`MATCH(a:Usuario{username:$user_name_value}) - [r:SIGUE_A] -> (b:Usuario) RETURN b.username AS username`, {
        user_name_value: req.params.username
    }).then(
        result => {
            let users = [];
            result.records.forEach(record => {
                users.push( {
                    username: record.get('username'),
                });
            });

        return res.send(JSON.stringify(users));

    }
    ).catch(err => {
        return res.send('Error ocurred:' + err);
    })

    }

    catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred fetching user followed users'
        })
    }

}


userCtrl.renderUploadsForm  = (req, res) =>{
    console.log('ENTRANDO AL upload', req)
    //res.render('uploads');
    
}

module.exports = userCtrl;