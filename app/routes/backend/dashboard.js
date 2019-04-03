var express = require('express');
var router = express.Router();
const articlesModel = require(__pathModels + 'articles');
const categoriesModel = require(__pathModels + 'categories');
const usersModel = require(__pathModels + 'users');
const groupsModel = require(__pathModels + 'groups');
router.get('/',async function(req, res, next) {
    let params = {curStatus: 'all'};

    await articlesModel.countItem(params).then((data) => {
        params.countArticles = data;
    })
    await categoriesModel.countItem(params).then((data) => {
        params.countCategories = data;
    })
    await usersModel.countItem(params).then((data) => {
        params.countUsers = data;
    })
    await groupsModel.countItem(params).then((data) => {
        params.countGroups = data;
    })
    res.render(
        __pathViews_Admin + 'pages/dashboard/index', {
            pageTitle: 'Dashboard',
            params
        });
});

module.exports = router;
