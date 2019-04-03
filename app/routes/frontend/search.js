var express = require('express');
var router = express.Router();
const folderView = __pathViews_Blog + 'pages/search/';
const layoutBlog = __pathViews_Blog + 'frontend';
const articlesModel = require(__pathModels + 'articles');
const categoriesModel = require(__pathModels + 'categories');
const paramsHelper = require(__pathHelper + 'params');

router.get(('/sort_field/:field'), (req,res) =>{
    let sortField = paramsHelper.getParam(req.params, 'field','name');
    req.session.frontend_sort_field = sortField;
    res.redirect('/tim-kiem');
})
router.get(('/sort_type/:type'), (req,res) =>{
    let sortType = paramsHelper.getParam(req.params, 'type','name');
    req.session.frontend_sort_type = sortType;
    res.redirect('/tim-kiem');
})
router.get('/', async function (req, res, next) {
    let params = {};
    params.keyword = paramsHelper.getParam(req.session, 'keyword', '');
    if(params.keyword !== '') {
        let categories = [];
        await categoriesModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
            categories = items;
        })
        const id = paramsHelper.getParam(req.params, 'id', categories[0].id);
        const slug = paramsHelper.getParam(req.params, 'slug', categories[0].slug);
        params.curStatus = paramsHelper.getParam(req.params, 'status', 'all');
        //Sort
        params.sortField = paramsHelper.getParam(req.session, 'frontend_sort_field', 'name');
        params.sortType = paramsHelper.getParam(req.session, 'frontend_sort_type', 'asc');
        params.category_id = 'allvalue';
        params.pagination = {
            totalItems: 1,
            totalItemsPerPage: 8,
            currentPage: 1,
            pageRange: 3

        }
        params.pagination.currentPage = parseInt(paramsHelper.getParam(req.query, 'page', 1));

        await articlesModel.countItem(params).then((data) => {
            params.pagination.totalItems = data;
        })
        let itemSearchResult = [];
        await articlesModel.listItems(params).then((items) => {
            itemSearchResult = items;
        });
        params.itemSearchResult = itemSearchResult;
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
        res.render(`${folderView}index`, {
            layout: layoutBlog ,
            categories,
            params,
            sortType,
            sortField,
        });
    } else {
        res.redirect('/');
    }

});
router.post('/', async function (req, res, next) {
    let keyword = req.body.keyword;
    req.session.keyword = keyword;
    if (keyword == '') {
        res.json(JSON.stringify({success: true}));
    } else {
        res.json(JSON.stringify({success: true}))
    }
});

module.exports = router;
