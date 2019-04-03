var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/shop/';
const layoutBlog = __pathViews_Blog + 'frontend';
const articlesModel = require(__pathModels + 'articles');
const categoriesModel = require(__pathModels + 'categories');

/* GET home page. */
router.get('/', async function (req, res, next) {
    let categories = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
        categories = items;
    })
    let itemsSpecial = [];
    await articlesModel.listItemsFrontend(null, {task: 'items-special'}).then((items)=>{
        itemsSpecial = items;
    })

    let itemInCategories = await Promise.all(categories.map(async item => {
        let listBooks;
        await articlesModel.listItemsFrontend({id: item.id, limit: 10}, {task: 'items-in-category'}).then((items)=>{
             listBooks = items;
        })
        return listBooks
    }))
    res.render(`${folderView}index`, {
        layout: layoutBlog ,
        categories,
        itemsSpecial,
        itemInCategories
    });
});
module.exports = router;
