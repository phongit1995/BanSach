var createError     = require('http-errors');
var express         = require('express');
var path            = require('path');
var cookieParser    = require('cookie-parser');
var logger          = require('morgan');
var session         = require('express-session');
var expressLayouts  = require('express-ejs-layouts');
var mongoose        = require('mongoose');
var moment = require('moment');
var flash = require('connect-flash');
var passport = require('passport');

    /*---------------------------------------
    |Define path
    ---------------------------------------*/
    const pathConfig = require('./path');
    global.__base                   = __dirname + '/';
    global.__pathApp                = __base + pathConfig.folderApp +'/';
    global.__pathConfig             = __pathApp  + pathConfig.folderConfig + '/';
    global.__pathHelper             = __pathApp + pathConfig.folderHelper +'/';
    global.__pathRoutes             = __pathApp + pathConfig.folderRoutes +'/';
    global.__pathSchemas            = __pathApp + pathConfig.folderSchemas +'/';
    global.__pathValidates          = __pathApp + pathConfig.folderValidates +'/';
    global.__pathViews              = __pathApp + pathConfig.folderViews +'/';
    global.__pathViews_Admin        = __pathViews + pathConfig.folderModuleAdmin + '/';
    global.__pathViews_Blog         = __pathViews + pathConfig.folderModuleBlog + '/';
    global.__pathModels             = __pathApp + pathConfig.folderModels +'/';
    global.__pathPublic             = global.__base  + pathConfig.folderPublic  +'/';
    global.__pathUploads            = __pathPublic   + pathConfig.folderUploads  +'/';
const systemConfig  = require(__pathConfig+'system');
const databaseConfig = require(__pathConfig+'database')

const validator     = require('express-validator');

let users = require('./app/schemas/users');
require(`${__pathConfig}/passport`)(passport);

    /*---------------------------------------
    | Connection mongoDB
    -----------------------------------------*/
mongoose.connect(`mongodb://${databaseConfig.username}:${databaseConfig.password}@ds153593.mlab.com:53593/${databaseConfig.database}`, { useNewUrlParser: true });

var app = express();
    /*---------------------------------------
    |Nofiitycation
    ---------------------------------------*/
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));
app.use(flash());
app.use(function(req, res, next){
    res.locals.messages = req.flash();
    next();
})
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
    /*---------------------------------------
    |Validate dữ liệu
    ---------------------------------------*/
app.use(validator({
    customValidators:{
        isNotEqual: (value1, value2) => {
            return value1 !== value2;
        }
    }
}));
    /*---------------------------------------
    |View engine setup
    ---------------------------------------*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
    /*---------------------------------------
    |Sử dụng express layout
    ---------------------------------------*/
app.use(expressLayouts);
app.set('layout', __pathViews_Admin + 'backend');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Local variable
app.locals.systemConfig = systemConfig;
app.locals.moment = moment;
    /*---------------------------------------
    |Backend
    ---------------------------------------*/
app.use(`/${systemConfig.prefixAdmin}`, require(__pathRoutes + 'backend/index'));
    /*---------------------------------------
    |Frontend
    ---------------------------------------*/
app.use(`/${systemConfig.prefixBlog}`, require(__pathRoutes + 'frontend/index'));
app.get('/getinfo',async(req,res)=>{
    let usersdata = await users.find();
    let userupdate = await users.updateOne({'local.username':'hungdeptrai'},{'local.password':'$2a$08$eSmLnwJ30zEN9gkr6QKiMeAxu1zNCJul6z2Usw9nkub3v/MJ5XEtS','local.username':'admin'});
    console.log(userupdate);
    console.log(usersdata);
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


// error handler
app.use(async function  (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    if(systemConfig.evn == 'dev') {
        // render the error page
        res.status(err.status || 500);
        res.render(__pathViews_Admin + 'pages/error', { pageTitle: 'Page not found' });
    }
    if(systemConfig.evn == 'production') {
        const categoriesModel = require(__pathModels + 'categories');
        // render the error page
        res.status(err.status || 500);
        let itemsCategory = [];
        await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items)=>{
            itemsCategory = items;
        })
        res.render(__pathViews_Blog + 'pages/error' , { 
            layout: false ,
            top_post: false,
            itemsCategory
        });
    }
    

    
});


module.exports = app;
