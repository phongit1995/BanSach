var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/home/';
const layoutBlog = __pathViews_Blog + 'frontend';
const articlesModel = require(__pathModels + 'articles');
const categoriesModel = require(__pathModels + 'categories');
const websiteSchemas = require(__pathSchemas + 'website');
/* GET home page. */
router.get('/',  async function (req, res, next) {
    let itemsSpecial = [];
    await articlesModel.listItemsFrontend(null, {task: 'items-special'}).then((items)=>{
        itemsSpecial = items;
    })
    let itemNews = [];
    await articlesModel.listItemsFrontend({limit: 10, skip: 0}, {task: 'items-news'}).then((items)=>{
        itemNews = items;
    })
    let categories = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
        categories = items;
    })
    let slides = [];
    await websiteSchemas.findOne().then((item)=>{
        slides = item.slides;
    })
    res.render(`${folderView}index`, {
        layout: layoutBlog,
        itemsSpecial,
        itemNews,
        categories,
        slides
    });
});
router.post('/loadmore-books', async function(req, res) {
    currentLength = req.body.currentLength;
    let itemNews = [];
    await articlesModel.listItemsFrontend({limit: 5, skip: currentLength}, {task: 'items-news'}).then((items)=>{
        itemNews = items;
    })
    res.json(JSON.stringify(itemNews));
})
module.exports = router;
