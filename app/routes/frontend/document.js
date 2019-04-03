var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/document/';
const layoutBlog = __pathViews_Blog + 'frontend';
const documentModel = require(__pathModels + 'document');
const categoriesModel = require(__pathModels + 'categories');
const articlesModel = require(__pathModels + 'articles');
const paramsHelper = require(__pathHelper + 'params');

router.get('/',  async function (req, res, next) {
    let categories = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
        categories = items;
    })
    let itemsSpecial = [];
    await documentModel.listItemsFrontend(null, {task: 'items-special'}).then((items)=>{
        itemsSpecial = items;
    })
    let params = {};
    params.keyword = paramsHelper.getParam(req.session, 'keyword_document', '');
    params.curStatus = 'active';
    //Sort
    params.category_id = 'allvalue';
    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 4,
        currentPage: 1,
        pageRange: 3

    }
    params.pagination.currentPage = parseInt(paramsHelper.getParam(req.query, 'page', 1));
    await documentModel.countItem(params).then((data) => {
        params.pagination.totalItems = data;
    })
    let itemsAll = [];
    await documentModel.listItems(params).then((items) => {
        itemsAll = items;
    });
    let itemNews = [];
    await documentModel.listItemsFrontend(null, {task: 'items-news'}).then((items)=>{
        itemNews = items;
    })
    let itemTopsViews = [];
    await documentModel.listItemsFrontend(null, {task: 'items-top-views'}).then((items)=>{
        itemTopsViews = items;
    })
    let booksSpecial = [];
    await articlesModel.listItemsFrontend(null, {task: 'items-special'}).then((items)=>{
        booksSpecial = items;
    })
    res.render(`${folderView}index`, {
        layout: layoutBlog,
        title: 'document',
        categories,
        itemsSpecial,
        itemsAll,
        params,
        itemNews,
        itemTopsViews,
        booksSpecial
    });
});
router.get('/xem-tai-lieu/:id/:slug',async (req, res) => {
    const id = paramsHelper.getParam(req.params, 'id', '');
    const slug = paramsHelper.getParam(req.params, 'slug', '');
    let itemSelectedView = null;
    await documentModel.getItemFrontend(id, null).then((item) => {
        itemSelectedView = item;
    })
    await documentModel.updateCounts(id, {counts: itemSelectedView.counts + 1}).then((item)=>{})
    let categories = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
        categories = items;
    })
    let itemNews = [];
    await documentModel.listItemsFrontend(null, {task: 'items-news'}).then((items)=>{
        itemNews = items;
    })
    let itemTopsViews = [];
    await documentModel.listItemsFrontend(null, {task: 'items-top-views'}).then((items)=>{
        itemTopsViews = items;
    })
    let booksSpecial = [];
    await articlesModel.listItemsFrontend(null, {task: 'items-special'}).then((items)=>{
        booksSpecial = items;
    })
    res.render(`${folderView}detail`, {
        layout: layoutBlog,
        title: 'document',
        categories,
        itemSelectedView,
        itemNews,
        itemTopsViews,
        booksSpecial

    });
})
router.get('/dowloadPDF/:id/:pdf',async (req, res) => {
    let pdfName = paramsHelper.getParam(req.params, 'pdf', '');
    let id = paramsHelper.getParam(req.params, 'id', '');
    let pdfPath = __pathUploads  + 'pdf-demo/web/' + pdfName;
    let itemDownload = null;
    await documentModel.getItemFrontend(id).then((item)=>{
        itemDownload = item;
    })
    itemDownload.download++;
    await documentModel.updateCounts(id, {download: itemDownload.download}).then((item)=>{});
    res.download(pdfPath);
})
router.post('/tim-kiem', (req, res) => {
    req.session.keyword_document = req.body.keyword;
    res.redirect('/tai-lieu');
})
module.exports = router;
