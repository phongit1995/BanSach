var express = require('express');
var router = express.Router();

router.use('/auth', require('./auth'));
router.use('/', isLoggedInAdmin, require('./home'));
router.use('/category', require('./categories'));
router.use('/article', require('./articles'));
router.use('/groups', require('./groups'));
router.use('/users', require('./users'));
router.use('/dashboard', require('./dashboard'));
router.use('/website', require('./website'));
router.use('/document', require('./document'));
function isLoggedInAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.group_acp === 'yes')
        return next();
    res.redirect('/admin/auth/login');
}
module.exports = router;
