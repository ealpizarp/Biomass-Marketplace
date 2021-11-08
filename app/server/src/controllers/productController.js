const upload = require("../middleware/upload");
const download = require("../middleware/download");
const {neo4jdriver, my_sql_conn} = require("../../public/db");
const { v4: uuidv4 } = require('uuid');
const e = require("express");

const productCtrl = {};

productCtrl.fetch_categories = async(req, res) => {
    
    try {
        
        let categories = [];
        const neo4jSession = neo4jdriver.session();
        neo4jSession.run('MATCH(c:Categoria) RETURN c').then(
            result => {
                result.records.forEach(record => {
                    //console.log(record._fields[0].properties);
                    categories.push(record._fields[0].properties.nombre);
                })

                return res.send(JSON.stringify(categories))
            }
        ).catch(err => {
            console.log(err);
            
        })
         
    } catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred fetching categories'
        })
    }
}

productCtrl.fetch_category_products = async (req, res) => {

    try {
        let products = [];
        const neo4jSession = neo4jdriver.session();

        neo4jSession.run('MATCH (p:Producto) - [r:PERTENECE_A] -> (c:Categoria{nombre:$nombre_cat}) RETURN p', { 
        nombre_cat: req.params.category_name }).then(
        result => {
            result.records.forEach(record => {
                products.push( {
                    nombre: record._fields[0].properties.nombre,
                    precio: record._fields[0].properties.precio,
                    id_mysql: record._fields[0].properties.id_mysql,
                    main_image: record._fields[0].properties.main_image
            });
            });
            //console.log(products);
            return res.send(JSON.stringify(products));

        }).catch(err => {
            console.log(err);
        })
    } catch(err) {
        console.log(err);
        return res.status(400).jason({
            msg: 'Error occurred fetching category products'
        })
    }
}

productCtrl.fetch_detailed_product = async (req, res) => {
    try {
        
        const query = 'SELECT * FROM Producto WHERE id_producto = ?';

        my_sql_conn.query(query,[req.params.product_id], function (error, results, fields) {
            if (error) throw error;
        if(results.length != 0){

            const es_bloqueado = (results[0].bloqueado_producto === 1) ? 'Si' : 'No';
            const tiene_envio_rapido = (results[0].envio_rapido === 1) ? 'Disponible' : 'No disponible';

            const producto = {

            id_producto: results[0].id_producto,
            titulo_producto: results[0].titulo_producto,
            descripcion_producto: results[0].descripcion_producto,
            precio_producto: results[0].precio_producto,
            inventario_producto: results[0].inventario_producto,
            envio_rapido: tiene_envio_rapido,
            producto_bloqueado: es_bloqueado

            }

            return res.send(JSON.stringify(producto))
        }
        else {
            return res.send('Cannot find the product with the given id');
        }

        });
    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred while trying to find product'
        })
    }
}


productCtrl.register_product = async(req, res) => {

    try {
    const {title, description, price, inventory, category, express_shipping, blocked_product} = req.body;
    const new_uuid = uuidv4();

    console.log(new_uuid);

    my_sql_conn.query('INSERT INTO Producto VALUES (?,?,?,?,?,?,?,?)', [new_uuid, title, description, price,inventory, express_shipping, 
        blocked_product, '1618807612072-brand-identity.png'], function (error, results, fields) {
            if (error) throw error;
            const neo4jSession = neo4jdriver.session();

            neo4jSession.run(`MERGE (p:Producto{nombre:$title_value, precio:$price_value, id_mysql:$new_uuid_value, main_image:"1618807612072-brand-identity.png"}) 
            MERGE (c:Categoria{nombre:$category_name}) MERGE (p) - [r:PERTENECE_A] -> (c) RETURN p`,
            {
                category_name: category,
                title_value: title,
                price_value: price,
                new_uuid_value: new_uuid

            }).then(
                result => {
                    const singleRecord = result.records[0];
                    const node = singleRecord._fields[0];

                    console.log('Succesfully created ' + node.properties.nombre + ' node in Neo4j');

                    }).catch(err => {
                        return res.send('Error occurred while trying to create category node on Neo4j');
                });

            return res.send('Product registered successfully');
        
        });
    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred during product registration'
        })
    }

}


productCtrl.fetch_product_by_title = async (req, res) => {

    try {

    my_sql_conn.query('SELECT id_producto, titulo_producto, precio_producto, imagen_producto FROM Producto WHERE MATCH(titulo_producto) AGAINST(? IN NATURAL LANGUAGE MODE);',
    [req.params.title_value], function (error, results, fields) {
        if (error) throw error;
        let results_array = [];
        results.forEach(result => {
                results_array.push({

                id_mysql: result.id_producto,
                main_image: result.imagen_producto,
                nombre: result.titulo_producto,
                precio: result.precio_producto

                });
        })

        return res.send(JSON.stringify(results_array));
    });

} catch(err) {
    console.log(err)
    return res.status(400).jason({
        msg: 'Error occured while trying to fetch products by title'
    })
}
}


productCtrl.fetch_product_by_description = async (req, res) => {

    try {

    my_sql_conn.query('SELECT id_producto, titulo_producto, precio_producto, imagen_producto FROM Producto WHERE MATCH(descripcion_producto) AGAINST(? IN NATURAL LANGUAGE MODE);',
    [req.params.description_value], function (error, results, fields) {
        if (error) throw error;
        let results_array = [];

        results.forEach(result => {
                results_array.push({

                id_mysql: result.id_producto,
                main_image: result.imagen_producto,
                nombre: result.titulo_producto,
                precio: result.precio_producto
            
                });
        })

        return res.send(JSON.stringify(results_array));
    });

} catch(err) {
    console.log(err)
    return res.status(400).jason({
        msg: 'Error occured while trying to fetch products by description'
    })
}
}


productCtrl.delete_product = async(req, res) => {

    try {
        const neo4jSession = neo4jdriver.session();

        neo4jSession.run('MATCH (p:Producto{id_mysql:$id_mysql_value}) DETACH DELETE p',
        {id_mysql_value: req.params.product_id}).then(
            result => {
                console.log(result.summary.counters);
            }).catch(err => {
                return res.send('Error ocurred:' + err);
            })

        my_sql_conn.query('DELETE FROM Producto WHERE id_producto = ?', [req.params.product_id], 
        function (error, results, fields) {
            if (error) throw error;

            return res.send('deleted ' + results.affectedRows + ' rows');
        })
    
    } catch(err) {
    console.log(err)
    return res.status(400).jason({
        msg: 'Error ocurred while trying to delete product'
    })
}

}


productCtrl.add_product_image = async (req,res) => {

    const {product_id, image_filename} =  req.body;

    new_uuid = uuidv4();

    try {

        my_sql_conn.query('INSERT INTO Foto_producto VALUES (?, ?, ?);', [new_uuid, image_filename, product_id], (error, results, fields) => {

            if (error) throw error;

            return res.send('Image filename added succesfully to database');
        })

    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred while trying to add image filename to database'
        })
    }

}


productCtrl.add_product_video = async (req,res) => {

    const {product_id, video_filename} =  req.body;

    new_uuid = uuidv4();

    try {

        my_sql_conn.query('INSERT INTO Video_producto VALUES (?, ?, ?);', [new_uuid, video_filename, product_id], (error, results, fields) => {

            if (error) throw error;

            return res.send('Video filename added succesfully to database');
        })

    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred while add video filename to database'
        })
    }

}

productCtrl.fetch_all_product_images = async (req, res) => {

    try {
        my_sql_conn.query('SELECT filename_foto FROM Foto_producto WHERE id_producto_FK = ?', [req.params.product_id], (error, results, fields) => {

            let results_array = [];
            
            results.forEach(result => {
                    results_array.push(result.filename_foto);
            })

            return res.send(JSON.stringify(results_array));
        })

    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred while trying to fetch product image filenames'
        })
    }
}

productCtrl.fetch_all_product_videos = async (req, res) => {

    try {
        my_sql_conn.query('SELECT filename_video FROM Video_producto WHERE id_producto_FK = ?', [req.params.product_id], (error, results, fields) => {

            let results_array = [];
            results.forEach(result => {
                    results_array.push(result.filename_video);
            })

            return res.send(JSON.stringify(results_array));
        })

    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred while trying to fetch product video filenames'
        })
    }
}



productCtrl.update_product = async (req, res) => {
    try {

        const {id_mysql, title, description, price, category, inventory,  express_shipping, blocked_product} = req.body;

        my_sql_conn.query('SELECT titulo_producto FROM Producto WHERE id_producto = ?',[id_mysql], async (error, results, fields) => {
            if (error) throw error;
        if(results.length == 0){
            return res.send('There is no product registered under the given ID');
            }
        else {
        
            if (category != null){

                try {
                const neo4jSession = neo4jdriver.session();

                const txc = neo4jSession.beginTransaction()

                const res_1 = await txc.run(
                    'MATCH (p:Producto{id_mysql: $id_mysql_value}) - [r:PERTENECE_A] -> () DELETE r',
                    {
                        id_mysql_value: id_mysql
                    }
                )

                console.log(res_1.summary.counters);

                const res_2 = await txc.run(
                    `MATCH (p:Producto{id_mysql: $id_mysql_value}) MERGE (c:Categoria{nombre:$category_name}) 
                                MERGE (p)- [r:PERTENECE_A] -> (c) RETURN c`,
                    {
                        id_mysql_value: id_mysql,
                        category_name: category
                    }
                )
                
                const singleRecord = res_2.records[0];
                const node = singleRecord._fields[0];

                console.log('Succesfully updated relationship to the following category ' + node.properties.nombre + ' in Neo4j');

                await txc.commit()
                console.log('committed')
                } catch (error) {
                console.log(error)
                await txc.rollback()
                console.log('rolled back')
                } finally {
     
                }
            }
            const neo4jSession = neo4jdriver.session();

            neo4jSession.run(`MATCH (p:Producto{id_mysql: $id_mysql_value}) SET p.nombre = COALESCE($nombre_value, p.nombre), 
            p.precio = COALESCE($precio_value, p.precio)`, {id_mysql_value: id_mysql, nombre_value: title, precio_value: price}).then(
                result => {
                    console.log(result.summary.counters);
                }).catch(err => {
                    console.log('Error ocurred:' + err);
                })

            my_sql_conn.query(`UPDATE Producto SET titulo_producto = COALESCE(?, titulo_producto), descripcion_producto = COALESCE(?, descripcion_producto),
                                precio_producto = COALESCE(?, precio_producto), inventario_producto =  COALESCE(?, inventario_producto), 
                                envio_rapido = COALESCE(?, envio_rapido), bloqueado_producto = COALESCE(?,bloqueado_producto) WHERE id_producto = ?`, 
            [title, description, price, inventory, express_shipping, blocked_product, id_mysql], (error, results, fields) => {
            if (error) throw error;

            return res.send('Product updated succesfully!')

        });
    }
    });
    } catch(err) {
    console.log(err)
    return res.status(400).jason({
        msg: 'Error ocurred during product update'
    })
}
}

productCtrl.rate_product = async (req, res) => {
    const { username, product_id, rating } = req.body;


    
    my_sql_conn.query('SELECT titulo_producto FROM Producto WHERE id_producto = ?',[product_id], async (error, results, fields) => {
        if (error) throw error;
    if(results.length == 0){
        return res.send('There is no product registered under the given ID');
        }
    else {
        const neo4jSession = neo4jdriver.session();

        neo4jSession.run(`MATCH (u:Usuario{username:$username_value}),(p:Producto{id_mysql:$id_mysql_value})
                        MERGE (u)-[r:CALIFICA_A]->(p) ON CREATE SET r.num_estrellas = $rating_value ON MATCH SET r.num_estrellas = $rating_value
                        RETURN TYPE(r)`, 
                        {
                            username_value: username,
                            id_mysql_value: product_id,
                            rating_value: parseInt(rating)
                        }).then(
                            result => {
                                const singleRecord = result.records[0];
                                console.log('Relationship of type ' + singleRecord._fields[0] + ' created succesfully');
                                return res.send('User rating succesfully registered')
                            }
                        ).catch(err => {
                            return res.send('Error ocurred trying to register user rating:' + err);
                        })
    }
    });
}

productCtrl.fetch_product_rating = async (req, res) => {

    my_sql_conn.query('SELECT titulo_producto FROM Producto WHERE id_producto = ?',[req.params.product_id], (error, results, fields) => {
        if (error) throw error;
    if(results.length == 0){
        return res.send('There is no product registered under the given ID');
        }
    else {
        const neo4jSession = neo4jdriver.session();

        neo4jSession.run(`MATCH (u:Usuario) - [r:CALIFICA_A] -> (p:Producto{id_mysql:$id_mysql_value}) RETURN avg(r.num_estrellas)`, {
            id_mysql_value: req.params.product_id
        }).then(
            result => {

                const singleRecord = result.records[0];
                const result_value = {
                    rating: singleRecord._fields[0]
                }

                return res.send(JSON.stringify(result_value))
            }
        ).catch(err => {
            return res.send('Error ocurred trying to fetch product rating:' + err);
        })
    }
});
}

productCtrl.change_product_main_pic = async (req, res) => {
    try {

        const {product_id, filename} = req.body;
        const neo4jSession = neo4jdriver.session();

        my_sql_conn.query(`UPDATE Producto SET imagen_producto = COALESCE(?, imagen_producto) WHERE id_producto = ?`,
        [filename, product_id], (error, results, fields) => {
            if (error) throw error;

            console.log(results.affectedRows);

        })

        neo4jSession.run(`MATCH (p:Producto{id_mysql:$mysql_value}) SET p.main_image = $new_filename`, 
        {mysql_value:product_id, new_filename: filename}).then(
            result => {
            console.log(result.summary.counters);
            return res.send('Product main image filename updated succesfully')
            }).catch(err => {
                return res.send('Error ocurred while trying to update main image filename:' + err);
            })
    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred product main image filename update'
        })
    }

}

productCtrl.fetch_product_inventory = async (req, res) => {
    try {
        my_sql_conn.query('SELECT inventario_producto FROM Producto WHERE id_producto = ?', [req.params.product_id], (error, results, fields) => {
            if (error) throw error;
            return res.send(JSON.stringify(results[0].inventario_producto));
        })

    } catch(err) {
        console.log(err)
        return res.status(400).jason({
            msg: 'Error ocurred while trying to fetch product image filenames'
        })
    }
}

productCtrl.fetch_product_comments = async (req, res) => {
    const neo4jSession = neo4jdriver.session();

    neo4jSession.run(`MATCH (u:Usuario) - [r:COMENTA_A] -> (p:Producto{id_mysql:$id_mysql_value}) RETURN u.username AS username, r.comentario AS comentario`, {
        id_mysql_value: req.params.product_id
    }).then(
        result => {
            let comments = [];
            result.records.forEach(record => {
                comments.push( {
                    username: record.get('username'),
                    comentario: record.get('comentario')
                });
            });
            return res.send(JSON.stringify(comments));

        }
    ).catch(err => {
        return res.send('Error ocurred trying to fetch product comments:' + err);
    })
}


module.exports = productCtrl;