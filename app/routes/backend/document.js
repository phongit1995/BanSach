var express = require('express');
var router = express.Router();

const systemConfig = require(__pathConfig + 'system');
const notify = require(__pathConfig + 'notify');
const articlesModel = require(__pathModels + 'document');
const categoriesModel = require(__pathModels + 'categories');
const utilsHelper = require(__pathHelper + 'utils');
const paramsHelper = require(__pathHelper + 'params');
const fileHelper = require(__pathHelper + 'file');
const validateArticles = require(__pathValidates + 'document');
const validatePdfUpload = require(__pathValidates + 'pdf-upload')

const util = require('util');

const linkIndex = '/' + systemConfig.prefixAdmin + '/document/';
const pageTitleIndex = 'Documents Managment - List';
const pageTitleAdd = 'Documents Managment - Add';
const pageTitleEdit = 'Documents Managment - Edit';
const folderView = __pathViews_Admin + "pages/document/";

const uploadThumb = fileHelper.upload('thumb', 'documents', 10, 1, 'jpeg|jpg|png|gif');
const uploadPdf = fileHelper.upload('pdf-demo', 'pdf-demo/web', 10, 4, 'pdf|jpg');
/*---------------------------------------
| Get list
-----------------------------------------*/
router.get('(/status/:status)?', async function (req, res, next) {
    let params = {};
    // keyword search
    params.keyword = paramsHelper.getParam(req.query, 'keyword', '');;
    // status
    params.curStatus = paramsHelper.getParam(req.params, 'status', 'all');
    let statusFilter = await utilsHelper.createFilterStatus(params.curStatus, 'document');
    //Sort
    params.sortField = paramsHelper.getParam(req.session, 'sort_field', 'name');
    params.sortType = paramsHelper.getParam(req.session, 'sort_type', 'asc');
    //filter
    params.category_id = paramsHelper.getParam(req.session, 'category_id', 'allvalue');
    dataLengthTable = paramsHelper.getParam(req.session, 'dataLengthTable', '5');
    params.dataLengthTable = dataLengthTable;
    params.lengthTable = [5,10,15,25,50,100];
    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: parseInt( params.dataLengthTable),
        currentPage: 1,
        pageRange: 3

    }
    let categoryItems = [];
    await categoriesModel.listItemsInSelectBox().then((items) => {
        categoryItems = items;
        categoryItems.unshift({ _id: 'allvalue', name: "All Category" });
    })

    params.pagination.currentPage = parseInt(paramsHelper.getParam(req.query, 'page', 1));

    await articlesModel.countItem(params).then((data) => {
        params.pagination.totalItems = data;
    })
    articlesModel.listItems(params).then((items) => {
        res.render(`${folderView}list`, {
            pageTitle: pageTitleIndex,
            items: items,
            statusFilter: statusFilter,
            categoryItems,
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
    articlesModel.changeStatus(id, curStatus, { task: "update_one" }).then((result) => {
        req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
        res.redirect(linkIndex);
    })
});
router.get('/change-special/:id/:special', function (req, res, next) {
    let curSpecial = paramsHelper.getParam(req.params, 'special', 'active');
    let id         = paramsHelper.getParam(req.params, 'id', '');
    articlesModel.changeSpecial(id, curSpecial, { task: "update_one" }).then((result) => {
        req.flash('success', notify.CHANGE_SPECIAL_SUCCESS, false);
        res.redirect(linkIndex);
    })
});
/*---------------------------------------
| Change status multy
-----------------------------------------*/
router.post('/change-status/:status', function (req, res, next) {
    let curStatus = paramsHelper.getParam(req.params, 'status', 'active');
    articlesModel.changeStatus(req.body.cid, curStatus, { task: "update_multi" }).then((result) => {
        req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    })
});
/*---------------------------------------
| Delete One
-----------------------------------------*/
router.get('/delete/:id', function (req, res, next) {
    let id = paramsHelper.getParam(req.params, 'id', '');

    articlesModel.deleteItem(id, { task: "delete-one" }).then((result) => {
        req.flash('success', notify.DELETE_SUCCESS, false);
        res.redirect(linkIndex);
    })

});
/*---------------------------------------
| Delete multy
-----------------------------------------*/
router.post('/delete/', function (req, res, next) {
    articlesModel.deleteItem(req.body.cid, { task: "delete-multi" }).then((result) => {
        req.flash('success', util.format(notify.DELETE_MULTI_SUCCESS, result.n), false);
        res.redirect(linkIndex);
    })
});

/*---------------------------------------
| Change ordering
-----------------------------------------*/
router.post('/change-ordering/', function (req, res, next) {
    let cids = req.body.cid;
    let orderings = req.body.ordering;
    articlesModel.changeOrdering(cids, orderings, null).then((result) => {
        req.flash('success', notify.CHANGE_ORDERING_SUCCESS, false);
        res.redirect(linkIndex);
    })
});

/*---------------------------------------
| Form(add | edit)
-----------------------------------------*/
router.get(('/form(/:id)?'), async function (req, res, next) {
    let id = paramsHelper.getParam(req.params, 'id', '');
    let item = { name: '', ordering: 0, status: 'novalue', category_id: "", category_name: "" };
    let errors = null;
    let categoryItems = [];
    await categoriesModel.listItemsInSelectBox().then((items) => {
        categoryItems = items;
        categoryItems.unshift({ _id: 'allvalue', name: "All Category" });
    })
    if (id === '') {
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, categoryItems, item, errors });
    } else {
        articlesModel.getItem(id).then((item) => {
            item.category_id = item.category.id;
            item.category_name = item.category.name;

            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, categoryItems, item, errors });
        })

    }
});

/*---------------------------------------
| Add element (phân biệt add và edit)
-----------------------------------------*/
router.post('/save/',  function (req, res, next) {
    uploadThumb(req, res, async (errUpload) => {
        req.body = JSON.parse(JSON.stringify(req.body));
        let item = Object.assign(req.body);
        let taskCurrent = (typeof (item) !== "undefined" && item.id !== "") ? "edit" : "add";
        let errors = validateArticles.validator(req, errUpload, taskCurrent);
        if (errors.length > 0) {
            //xoá hình khi form không hợp lệ
            if(req.file != undefined) {
                fileHelper.remove('public/uploads/documents/', req.file.filename);
            }
            let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;
            let categoryItems = [];
            await categoriesModel.listItemsInSelectBox().then((items) => {
                categoryItems = items;
                categoryItems.unshift({ _id: 'allvalue', name: "All Category" });
            })
            if(taskCurrent == 'edit') {
                item.thumb = (item.imageOld != '') ? item.imageOld : "no-thumb.png";
            }

            res.render(`${folderView}form`, { pageTitle, item, errors, categoryItems });
        } else {

            let message = (taskCurrent == "add") ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
            if(req.file == undefined) { //ko upload lại hình
                item.thumb = item.imageOld;
            } else { //up hình mới thì xoá hình cũ
                item.thumb = req.file.filename;
                if(taskCurrent == 'edit'    ) fileHelper.remove('public/uploads/documents/', item.imageOld);
            }
            articlesModel.saveItem(item, { task: taskCurrent }).then((result) => {
                req.flash('success', message, false);
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
router.get(('/filter_category/:category_id'), (req, res) => {
    //get params
    let category_id = paramsHelper.getParam(req.params, 'category_id', '');
    req.session.category_id = category_id;
    res.redirect(linkIndex);
})


router.get(('/table_length_change/:value'), (req, res) => {
    //get params
    let value = paramsHelper.getParam(req.params, 'value', '');
    req.session.dataLengthTable = value;
    res.redirect(linkIndex);
})

const articlesSchemas = require(__pathSchemas + 'document');
router.get(('/upload-pdf/:id/:pdf'), async (req, res) => {
    let id = paramsHelper.getParam(req.params, 'id', '');
    let pdf = paramsHelper.getParam(req.params, 'pdf', '');
    let item = { id: id, pdf: pdf};
    await articlesSchemas.findById(id, 'name').then((result) => {
        item.moreImage = result.moreImage;
        item.name = result.name;
    })
    let errors = null;
    res.render(`${folderView}uploadpdf`, { pageTitle: 'Add PDF Document', item, errors});
})
router.post('/upload-pdf/save',  function (req, res, next) {
    uploadPdf(req, res, async (errUpload) => {
        req.body = JSON.parse(JSON.stringify(req.body));
        let item = Object.assign(req.body);
        let taskCurrent = (typeof (item) !== "undefined" && item.imageOld !== "") ? "edit" : "add";
        let errors = validatePdfUpload.validator(req, errUpload, taskCurrent);
        if (errors.length > 0) {
            if(req.file != undefined) {
                fileHelper.remove('public/uploads/pdf-demo/web/', req.file.filename);
            }
            let pageTitle = (taskCurrent == "add") ? 'Add PDF File Demo' : 'Add PDF File Demo';
            if(taskCurrent == 'edit') {
                item.pdf = (item.imageOld != '') ? item.imageOld : "no-pdf.png";
            }
            res.render(`${folderView}uploadpdf`, { pageTitle, item, errors});
        } else {
            let message = (taskCurrent == "add") ? 'Add file demo pdf success' : 'Edit file pdf demo successs';
            if(req.file == undefined) {
                item.pdf = item.imageOld;
            } else { //up hình mới thì xoá hình cũ
                item.pdf = req.file.filename;
                if(taskCurrent == 'edit'    ) fileHelper.remove('public/uploads/pdf-demo/web/', item.imageOld);
            }
            await articlesSchemas.updateOne({_id: item.id}, {pdf:  item.pdf} ).then((user)=>{
                req.flash('success', message);
                res.redirect(linkIndex);
            })

        }
    })
});
module.exports = router;
