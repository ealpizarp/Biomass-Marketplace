const router = require("express").Router();
const {
    renderUploadsForm,
    upload,
    download,
    login,
    fetch_user_info,
    register_user,
    comentar_producto,
    delete_user_comment,
    change_profile_pic,
    update_user,
    user_recommendations,
    fetch_all_users,
    follow_user,
    fetch_followed_users,
    fetch_public_orders
} = require('../controllers/userController');

router.get('/uploads', renderUploadsForm);

router.post('/uploads', upload);

router.get('/file/:filename', download);

router.post('/login', login);

router.post('/register', register_user);

router.put('/user/profile/picture', change_profile_pic);

router.get('/user/:username', fetch_user_info);

router.get('/user/recommendations/:username', user_recommendations);

router.post('/user/comentar/producto', comentar_producto);

router.put('/user/update', update_user);

router.delete('/user/comment/delete/:username/:product_id', delete_user_comment);

router.post('/user/follow', follow_user);

router.get('/user/public/orders/:username', fetch_public_orders);

router.get('/user/following/:username', fetch_followed_users)

router.get('/users', fetch_all_users);

module.exports = router;