var express = require('express');
var router = express.Router();

const systemConfig = require(__pathConfig + 'system');
const notify = require(__pathConfig + 'notify');
const usersModel = require(__pathModels + 'users');
const groupsModel = require(__pathModels + 'groups');
const utilsHelper = require(__pathHelper + 'utils');
const paramsHelper = require(__pathHelper + 'params');
const fileHelper = require(__pathHelper + 'file');
const validateUsers = require(__pathValidates + 'users')
const util = require('util');

const linkIndex = '/' + systemConfig.prefixAdmin + '/users/';
const pageTitleIndex = 'Users Managment - List';
const pageTitleAdd = 'Users Managment - Add';
const pageTitleEdit = 'Users Managment - Edit';
const folderView = __pathViews_Admin + "pages/users/";

const uploadAvatar = fileHelper.upload('avatar', 'users', 10, 1, 'jpeg|jpg|png|gif');
/*---------------------------------------
| Get list 
-----------------------------------------*/
router.get('(/status/:status)?', async function (req, res, next) {
    let params = {};
    // keyword search 
    params.keyword = paramsHelper.getParam(req.query, 'keyword', '');;
    // status
    params.curStatus = paramsHelper.getParam(req.params, 'status', 'all');
    let statusFilter = await utilsHelper.createFilterStatus(params.curStatus, 'users');
    //Sort
    params.sortField = paramsHelper.getParam(req.session, 'sort_field', 'name');
    params.sortType = paramsHelper.getParam(req.session, 'sort_type', 'asc');
    //filter
    params.group_id = paramsHelper.getParam(req.session, 'group_id', 'allvalue');

    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 5,   // Tổng số phần tử trên 1 trang
        currentPage: 1,         // Trang hiện tại
        pageRange: 3

    }
    let groupItems = [];
    await groupsModel.listItemsInSelectBox().then((items) => {
        groupItems = items;
        groupItems.unshift({ _id: 'allvalue', name: "All Group" });
    })
    params.pagination.currentPage = parseInt(paramsHelper.getParam(req.query, 'page', 1));

    await usersModel.countItem(params).then((data) => {
        params.pagination.totalItems = data;
    })
    usersModel.listItems(params).then((items) => {
        res.render(`${folderView}list`, {
            pageTitle: pageTitleIndex, // title
            items: items,               //Đẩy items ra view
            statusFilter: statusFilter,
            groupItems,
            params
        });
    });
});
/*---------------------------------------
| Change status one
-----------------------------------------*/
router.get('/change-status/:id/:status', function (req, res, next) {
    let curStatus = paramsHelper.getParam(req.params, 'status', 'active');
    let id = paramsHelper.getParam(req.params, 'id', '');
    usersModel.changeStatus(id, curStatus, { task: "update_one" }).then((result) => {
        req.flash('success', notify.CHANGE_STATUS_SUCCESS);
        res.redirect(linkIndex);
    })
});
/*---------------------------------------
| Change status multy
-----------------------------------------*/
router.post('/change-status/:status', function (req, res, next) {
    let curStatus = paramsHelper.getParam(req.params, 'status', 'active');
    usersModel.changeStatus(req.body.cid, curStatus, { task: "update_multi" }).then((result) => {
        req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n));
        res.redirect(linkIndex);
    })
});
/*---------------------------------------
| Delete One
-----------------------------------------*/
router.get('/delete/:id', function (req, res, next) {
    let id = paramsHelper.getParam(req.params, 'id', '');
    
    usersModel.deleteItem(id, { task: "delete-one" }).then((result) => {
        req.flash('success', notify.DELETE_SUCCESS);
        res.redirect(linkIndex);
    })

});
/*---------------------------------------
| Delete multy
-----------------------------------------*/
router.post('/delete/', function (req, res, next) {
    usersModel.deleteItem(req.body.cid, { task: "delete-multi" }).then((result) => {
        req.flash('success', util.format(notify.DELETE_MULTI_SUCCESS, result.n));
        res.redirect(linkIndex);
    })
});

/*---------------------------------------
| Change ordering
-----------------------------------------*/
router.post('/change-ordering/', function (req, res, next) {
    let cids = req.body.cid;
    let orderings = req.body.ordering;
    usersModel.changeOrdering(cids, orderings, null).then((result) => {
        req.flash('success', notify.CHANGE_ORDERING_SUCCESS);
        res.redirect(linkIndex);
    })
});

/*---------------------------------------
| Form(add | edit)
-----------------------------------------*/
router.get(('/form(/:id)?'), async function (req, res, next) {
    let id = paramsHelper.getParam(req.params, 'id', '');
    let item = {
        name: '',
        ordering: 0,
        status: 'novalue',
        group_id: "",
        group_name: "" ,
        username: "",
        password: ""
    };
    let errors = null;
    let groupItems = [];
    await groupsModel.listItemsInSelectBox().then((items) => {
        groupItems = items;
        groupItems.unshift({ _id: 'allvalue', name: "All Group" });
    })
    if (id === '') {
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, groupItems, item, errors });
    } else {
        usersModel.getItem(id).then((item) => {
            item.group_id = item.group.id;
            item.group_name = item.group.name;
            item.username = item.local.username;
            item.password = item.local.password;

            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, groupItems, item, errors });
        })

    }
});

/*---------------------------------------
| Add element (phân biệt add và edit)
-----------------------------------------*/
router.post('/save/',  function (req, res, next) {
    uploadAvatar(req, res, async (errUpload) => {
        
        req.body = JSON.parse(JSON.stringify(req.body));
        let item = Object.assign(req.body);
        let taskCurrent = (typeof (item) !== "undefined" && item.id !== "") ? "edit" : "add";
        let errors = validateUsers.validator(req, errUpload, taskCurrent);
        if (errors.length > 0) {
            //xoá hình khi form không hợp lệ
            if(req.file != undefined) {
                fileHelper.remove('public/uploads/users/', req.file.filename);
            }
            let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;
            let groupItems = [];
            await groupsModel.listItemsInSelectBox().then((items) => {
                groupItems = items;
                groupItems.unshift({ _id: 'allvalue', name: "All Group" });
            })
            if(taskCurrent == 'edit') {
                item.avatar = (item.imageOld != '') ? item.imageOld : "no-avatar.png";
            }
            
            res.render(`${folderView}form`, { pageTitle, item, errors, groupItems });
        } else {
               
            let message = (taskCurrent == "add") ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
            if(req.file == undefined) { //ko upload lại hình
                item.avatar = item.imageOld;       
            } else { //up hình mới thì xoá hình cũ
                item.avatar = req.file.filename;
                if(taskCurrent == 'edit'    ) fileHelper.remove('public/uploads/users/', item.imageOld);
            }
            usersModel.saveItem(item, { task: taskCurrent }).then((result) => {
                req.flash('success', message);
                res.redirect(linkIndex);
            })
        }
    })

});
router.get(('/sort/:sort_field/:sort_type'), (req, res) => {
    //get params
    let sortField = paramsHelper.getParam(req.params, 'sort_field', 'ordering');
    let sortType = paramsHelper.getParam(req.params, 'sort_type', 'asc');
    req.session.sort_field = sortField;
    req.session.sort_type = sortType;
    res.redirect(linkIndex);
})

router.get(('/filter_group/:group_id'), (req, res) => {
    //get params
    let group_id = paramsHelper.getParam(req.params, 'group_id', '');
    req.session.group_id = group_id;
    res.redirect(linkIndex);
})

router.post(('/upload'), (req, res) => {
    let errors = [{ param: 'avatar', msg: "Chọn file cần upload !" }];
    uploadAvatar(req, res, function (err) {
        if (err) {
            errors.pop();
            errors.push({ param: 'avatar', msg: err });
        }
        res.render(`${folderView}upload`, { pageTitle: pageTitleIndex, errors });
    })

})
module.exports = router;
