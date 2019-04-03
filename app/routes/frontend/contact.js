var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/contact/';
const layoutBlog = __pathViews_Blog + 'frontend';
const articlesModel = require(__pathModels + 'articles');
const categoriesModel = require(__pathModels + 'categories');

/* GET home page. */
router.get('/', async function (req, res, next) {
    let itemsCategory = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items)=>{
        itemsCategory = items;
    })
    let itemsRandom = [];
    await articlesModel.listItemsFrontend(null, {task: 'items-random'}).then((items)=>{
        itemsRandom = items;
    })
    res.render(`${folderView}index`, { 
        layout: layoutBlog ,
        top_post: false,
        itemsCategory,
        itemsRandom
    });
});
module.exports = router;
