const router = require("express").Router();
const {fetch_cart, addItem, removeItem, finishShopping, getBills} = require('../controllers/cartController')

router.get('/getCart/:user',fetch_cart);
router.post('/addItem',addItem);
router.post('/removeItem',removeItem);
router.post('/finishShopping', finishShopping);
router.get('/getBills/:username', getBills);
module.exports = router;