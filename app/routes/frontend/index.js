var express = require('express');
var router = express.Router();

router.use('/', require('./home'));
router.use('/category', require('./category'));
router.use('/xem-sach', require('./article'));
router.use('/about', require('./about'));
router.use('/contact', require('./contact'));
router.use('/faq', require('./faq'));
router.use('/xem-sach-theo-mon', require('./shop'));
router.use('/the-loai', require('./category'));
router.use('/tim-kiem', require('./search'));
router.use('/tai-lieu', require('./document'));


module.exports = router;
