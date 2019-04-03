var express = require('express');
var router = express.Router();
const systemConfig  = require(__pathConfig + 'system');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect(`/${systemConfig.prefixAdmin}/dashboard`)
});
module.exports = router;
