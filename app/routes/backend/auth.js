var express = require('express');
var router = express.Router();
const folderView = __pathViews_Admin + "pages/auth/";
const systemConfig  = require(__pathConfig + 'system');
const validateLogin = require(__pathValidates + 'login')
var passport = require('passport');
const linkIndex         = '/' + systemConfig.prefixAdmin + '/dashboard/';
const linkLogin        = '/' + systemConfig.prefixAdmin + '/auth/login';
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect(linkLogin);
});
router.get('/login', function (req, res, next) {
    if (req.isAuthenticated()){
        res.redirect('/admin/dashboard');
    }
    let item = {
        username: '',
        'password': ''
    }
    let errors;
    res.render(`${folderView}login`, {
        layout: false,
        showFooter: false,
        item,
        errors
    });
});
router.post('/login', async function (req, res, next) {
    req.bodu = JSON.parse(JSON.stringify(req.body));
    validateLogin.validator(req);
    let item = Object.assign(req.body);
    let errors = req.validationErrors();
    if(errors) {
        res.render(`${folderView}login`, {
            layout: false,
            showFooter: false,
            message: req.flash('loginMessage'),
            item,
            errors
        });
    } else {
        passport.authenticate('local-login', {
            successRedirect: linkIndex ,
            failureRedirect: linkLogin,
            failureFlash : true
        })(req, res, next);
    }
});
module.exports = router;
