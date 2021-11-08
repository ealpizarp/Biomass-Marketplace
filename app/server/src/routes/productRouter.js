const router = require("express").Router();

const {
    fetch_categories,
    fetch_category_products,
    fetch_detailed_product,
    register_product,
    fetch_product_by_title,
    fetch_product_by_description,
    delete_product,
    update_product,
    rate_product,
    fetch_product_rating,
    fetch_product_comments,
    add_product_image,
    add_product_video,
    fetch_all_product_images,
    fetch_all_product_videos,
    fetch_product_inventory,
    change_product_main_pic
} = require('../controllers/productController');

router.get('/categorias', fetch_categories);

router.get('/categorias/:category_name', fetch_category_products);

router.get('/producto/:product_id', fetch_detailed_product);

router.post('/producto/register', register_product);

router.get('/producto/search/title/:title_value', fetch_product_by_title);

router.get('/producto/search/description/:description_value', fetch_product_by_description);

router.delete('/producto/delete/:product_id', delete_product);

router.put('/producto/update', update_product);

router.post('/producto/rate', rate_product);

router.get('/producto/rating/:product_id', fetch_product_rating);

router.get('/producto/comentarios/:product_id', fetch_product_comments);

router.post('/producto/add/photo', add_product_image);

router.post('/producto/add/video', add_product_video);

router.put('/producto/add/main/photo', change_product_main_pic);

router.get('/producto/imagenes/:product_id', fetch_all_product_images);

router.get('/producto/videos/:product_id', fetch_all_product_videos);

router.get('/producto/inventario/:product_id', fetch_product_inventory);

module.exports = router;