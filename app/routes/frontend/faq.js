var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/faq/';
const layoutBlog = __pathViews_Blog + 'frontend';
const categoriesModel = require(__pathModels + 'categories');

/* GET home page. */
router.get('/', async function (req, res, next) {
    let categories = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items)=>{
        categories = items;
    })

    res.render(`${folderView}index`, {
        layout: layoutBlog ,
        top_post: false,
        categories
    });
});
module.exports = router;
