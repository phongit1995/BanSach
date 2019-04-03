
var LocalStrategy = require('passport-local').Strategy;
const usersModel = require(__pathSchemas + 'users');
const groupsModel = require(__pathSchemas + 'groups');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(async function (id, done) {
        usersModel.findById(id, 'id avatar local.username name status email group.id', function (err, user) {
            groupsModel.findById(user.group.id, 'group_acp', function(err, group){
                user.group_acp = group.group_acp;
                done(err, user);
            })

        });
    });
    passport.use('local-login', new LocalStrategy({
            usernameField: `username`,
            passwordField: `password`,
            passReqToCallback: true
        }, function (req, username, password, done) {
            process.nextTick(function () {
                usersModel.findOne({ 'local.username': username, status: 'active' }, function (err, user) {
                    if (err) { return done(err); }
                    if (!user) {
                        return done(null, false,  { message: 'Thông tin đăng nhập không chính xác!' });
                    }
                    if (!user.validPassword(password)) {
                        return done(null, false, { message: 'Thông tin đăng nhập không chính xác!' });
                    }
                    return done(null, user);
                });
            })
        })
    );
    passport.use('local-signup', new LocalStrategy({
        usernameField: `username`,
        passwordField: `password`,
        passReqToCallback: true
    }, function (req, username, password, done) {

        process.nextTick(function () {
            usersModel.findOne({ 'local.username': username }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false);
                } else {
                    var newUser = new usersModel();
                    // lưu thông tin cho tài khoản local
                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.name = req.body.fullname;
                    newUser.email = req.body.email;
                    newUser.school = req.body.school;
                    newUser.phonenumber = req.body.phonenumber;
                    newUser.status = 'inactive';
                    newUser.group = {
                        id: '5c1c8af38ee89776e4e1ce55',
                        name: 'member'
                    };
                    newUser.created = {
                        user_id: "5c1b962e1a76d71bda336304",
                        user_name: "phihoan2201",
                        time: Date.now()
                    },
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                }
            });
        });
    }));

    passport.use('local-modified', new LocalStrategy({
        usernameField: `username`,
        passwordField: `password`,
        passReqToCallback: true
    }, function (req, username, password, done) {

        process.nextTick(function () {
            usersModel.findOne({ 'local.username': username }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false);
                } else {
                    var newUser = new usersModel();
                    // lưu thông tin cho tài khoản local

                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.name = req.body.fullname;
                    newUser.email = req.body.email;
                    newUser.school = req.body.school;
                    newUser.phonenumber = req.body.phonenumber;
                    newUser.status = 'inactive';

                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));


};
