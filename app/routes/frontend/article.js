var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/article/';
const layoutBlog = __pathViews_Blog + 'frontend';
const articlesModel = require(__pathModels + 'articles');
const categoriesModel = require(__pathModels + 'categories');
const paramsHelper = require(__pathHelper + 'params');

/* GET home page. */
router.get('/:slug/:id', async function (req, res, next) {
    const idPost = paramsHelper.getParam(req.params, 'id', '');
    let itemsSpecial = [];
    await articlesModel.listItemsFrontend(null, {task: 'items-special'}).then((items)=>{
        itemsSpecial = items;
    })
    let itemArticle;
    await articlesModel.getItemFrontend(idPost, null).then((item) => {
        itemArticle = item;
    })
    let categories = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
        categories = items;
    })
    res.render(`${folderView}index`, {
        layout: layoutBlog ,
        itemArticle,
        itemsSpecial,
        categories
    });
});

module.exports = router;
