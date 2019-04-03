var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/category/';
const layoutBlog = __pathViews_Blog + 'frontend';
const categoriesModel = require(__pathModels + 'categories');
const articlesModel = require(__pathModels + 'articles');
const paramsHelper = require(__pathHelper + 'params');
/* GET home page. */
router.get(('/sort_field/:slug/:id/:field'), (req,res) =>{
    const id = paramsHelper.getParam(req.params, 'id','');
    const slug = paramsHelper.getParam(req.params, 'slug', '');
    let sortField = paramsHelper.getParam(req.params, 'field','name');
    req.session.frontend_sort_field = sortField;
    let linkIndex = `/the-loai/${slug}/${id}`;
    res.redirect(linkIndex);
})
router.get(('/sort_type/:slug/:id/:type'), (req,res) =>{
    const id = paramsHelper.getParam(req.params, 'id','');
    const slug = paramsHelper.getParam(req.params, 'slug', '');
    let sortType = paramsHelper.getParam(req.params, 'type','name');
    req.session.frontend_sort_type = sortType;
    let linkIndex = `/the-loai/${slug}/${id}`;
    res.redirect(linkIndex);
})
router.get(('/entries/:slug/:id/:entries'), (req,res) =>{
    const id = paramsHelper.getParam(req.params, 'id','');
    const slug = paramsHelper.getParam(req.params, 'slug', '');
    let entries = paramsHelper.getParam(req.params, 'entries',4);
    req.session.frontend_entries = entries;
    let linkIndex = `/the-loai/${slug}/${id}`;
    res.redirect(linkIndex);
})
router.get('/:slug/:id',async function (req, res, next) {
    let categories = [];
    await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
        categories = items;
    })
    const id = paramsHelper.getParam(req.params, 'id', categories[0].id);
    const slug = paramsHelper.getParam(req.params, 'slug', categories[0].slug);
    let params = {};

    params.curStatus = paramsHelper.getParam(req.params, 'status', 'all');
    //Sort
    params.sortField = paramsHelper.getParam(req.session, 'frontend_sort_field', 'name');
    params.sortType = paramsHelper.getParam(req.session, 'frontend_sort_type', 'asc');
    params.category_id = id;
    params.slug = slug;
    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 4,
        currentPage: 1,
        pageRange: 3

    }
    params.pagination.totalItemsPerPage = parseInt(paramsHelper.getParam(req.session, 'frontend_entries', 4));
    params.pagination.currentPage = parseInt(paramsHelper.getParam(req.query, 'page', 1));
    await articlesModel.countItemCategory(params).then((data) => {
        params.pagination.totalItems = data;
    })
    let itemsOneCategory = [];
    await articlesModel.listItems(params).then((items) => {
        itemsOneCategory = items;
    });
    let sortField = [
        {value: 'name', name: 'Tên Sách'},
        {value: 'price', name: 'Giá Bán'},
        {value: 'coverprice', name: 'Giá Bìa'},
        {value: 'author', name: 'Tác Giả'}
    ]
    let sortType = [
        {value: 'asc', name: 'Tăng Dần'},
        {value: 'desc', name: 'Giảm Dần'}
    ]
    let entries = [
        {value: 4, name: '4 Phần tử'},
        {value: 8, name: '8 Phần tử'},
        {value: 12, name: '12 Phần tử'},
        {value: 16, name: '16 Phần tử'},
        {value: 20, name: '20 Phần tử'},
        {value: 32, name: '32 Phần tử'},
        {value: 60, name: '60 Phần tử'},
    ]
    let categoryName;
    await categoriesModel.getItem(id, null).then((item) => {
        categoryName = item.name;
    })
    res.render(`${folderView}index`, {
        layout: layoutBlog,
        categories,
        itemsOneCategory,
        params,
        sortField,
        sortType,
        categoryName,
        entries
    });
});

module.exports = router;
