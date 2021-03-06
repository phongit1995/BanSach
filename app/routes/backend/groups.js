var express = require('express');
var router = express.Router();
const systemConfig  = require(__pathConfig + 'system');
const notify        = require(__pathConfig + 'notify');
const groupsModel    = require(__pathModels  + 'groups');
const usersModel    = require(__pathModels + 'users');
const utilsHelper   = require(__pathHelper +'utils');
const paramsHelper  = require(__pathHelper + 'params');
const validateGroups = require(__pathValidates + 'groups')
const util          = require('util');

const linkIndex         = '/' + systemConfig.prefixAdmin + '/groups/';
const pageTitleIndex    =  'Groups Managment - List';
const pageTitleAdd      =  'Groups Managment - Add';
const pageTitleEdit     =  'Groups Managment - Edit';
const folderView        = __pathViews_Admin + "pages/groups/";
/*---------------------------------------
| Get list 
-----------------------------------------*/
router.get('(/status/:status)?',async function (req, res, next) {
    let params = {};
    // keyword search 
    params.keyword = paramsHelper.getParam(req.query, 'keyword', '');;
    // status
    params.curStatus = paramsHelper.getParam(req.params, 'status', 'all');
    let statusFilter = await utilsHelper.createFilterStatus(params.curStatus,'groups');
    //Sort
   
    params.sortField = paramsHelper.getParam(req.session, 'sort_field','name');
    params.sortType = paramsHelper.getParam(req.session, 'sort_type','asc');
    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 3,      // Tổng số phần tử trên 1 trang
        currentPage: 1,         // Trang hiện tại
        pageRange: 3
    }
    params.pagination.currentPage = parseInt(paramsHelper.getParam(req.query, 'page', 1));
    
    
    await groupsModel.countItem(params).then((data) => {
        params.pagination.totalItems = data;
    })
    groupsModel.listItems(params).then((items) => {
        res.render(`${folderView}list`, {
            pageTitle: pageTitleIndex, // title
            items: items,               //Đẩy items ra view
            statusFilter: statusFilter,
            params
        });
    });


});
/*---------------------------------------
| Change status one
-----------------------------------------*/
router.get('/change-status/:id/:status', function (req, res, next) {
    let curStatus   = paramsHelper.getParam(req.params, 'status', 'active');
    let id          = paramsHelper.getParam(req.params, 'id', '');
    groupsModel.changeStatus(id, curStatus, {task: "update_one"} ).then((result)=>{
        req.flash('success', notify.CHANGE_STATUS_SUCCESS);
        res.redirect(linkIndex); 
    })
});
/*---------------------------------------
| Change Group ACP
-----------------------------------------*/
router.get('/change-group_acp/:id/:group_acp', function (req, res, next) {
    let curGroupAcp   = paramsHelper.getParam(req.params, 'group_acp', 'yes');
    let id          = paramsHelper.getParam(req.params, 'id', '');
    
    groupsModel.changeGroupAcp(curGroupAcp, id, null).then((result) => {
        req.flash('success', notify.CHANGE_GROUP_ACP_SUCCESS);
        res.redirect(linkIndex);   
    })

});
/*---------------------------------------
| Delete One
-----------------------------------------*/
router.get('/delete/:id', function (req, res, next) {
    let id          = paramsHelper.getParam(req.params, 'id', '');
    groupsModel.deleteItem(id, {task: "delete-one"}).then((result) => {
        req.flash('success', notify.DELETE_SUCCESS);
        res.redirect(linkIndex);
    })
});


/*---------------------------------------
| Change status multy
-----------------------------------------*/
router.post('/change-status/:status', function (req, res, next) {
    let curStatus   = paramsHelper.getParam(req.params, 'status', 'active');
    groupsModel.changeStatus(req.body.cid, curStatus, {task: "update_multi"} ).then((result) => {
        req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n));
        res.redirect(linkIndex);
    })
});

/*---------------------------------------
| Delete multy
-----------------------------------------*/
router.post('/delete/', function (req, res, next) {
    groupsModel.deleteItem(req.body.cid, {task : "delete-multi"}).then((result) => {
        req.flash('success',util.format(notify.DELETE_MULTI_SUCCESS, result.n) );
        res.redirect(linkIndex);
    })
});

/*---------------------------------------
| Change ordering
-----------------------------------------*/
router.post('/change-ordering/', function (req, res, next) {
    let cids = req.body.cid;
    let orderings = req.body.ordering;
    groupsModel.changeOrdering(cids, orderings, null).then((result) => {
        req.flash('success', notify.CHANGE_ORDERING_SUCCESS);
        res.redirect(linkIndex);
    })
});

/*---------------------------------------
| Form(add | edit)
-----------------------------------------*/
router.get(('/form(/:id)?'), function (req, res, next) {
    let id  = paramsHelper.getParam(req.params, 'id', '');
    let item = {name: '', ordering: 0, status: 'novalue'};
    let errors = null;
    if(id === '') {
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd , item,errors});
    } else {
        groupsModel.getItem(id).then((item) => {
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit , item, errors});
        })
        
    } 
});

/*---------------------------------------
| Add element (phân biệt add và edit)
-----------------------------------------*/
router.post('/save/', function (req, res, next) {
    req.body = JSON.parse(JSON.stringify(req.body));
    let item = Object.assign(req.body);
    let taskCurrent  = (typeof(item) !== "undefined" && item.id !== "") ? "edit" : "add";
    let errors = validateGroups.validator(req);
    if (errors.length > 0) {
        let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;
        res.render(`${folderView}form`, { pageTitle: pageTitle , item, errors});
    } else {
        let message = (taskCurrent == "add") ? notify.ADD_SUCCESS: notify.EDIT_SUCCESS;
        groupsModel.saveItem(item, {task: taskCurrent}).then((result)=>{
            if(taskCurrent == "edit") {
                usersModel.saveItem(item, {task: "change-group-name"}).then((result)=>{
                    req.flash('success', notify.EDIT_SUCCESS);
                    res.redirect(linkIndex);  
                })
            }
            req.flash('success', message);
            res.redirect(linkIndex);    
        })
    }
});
router.get(('/sort/:sort_field/:sort_type'), (req,res) =>{
    //get params
    let sortField = paramsHelper.getParam(req.params, 'sort_field','ordering');
    let sortType = paramsHelper.getParam(req.params, 'sort_type','asc');
    req.session.sort_field = sortField;
    req.session.sort_type = sortType;
    res.redirect(linkIndex);
})
module.exports = router;
