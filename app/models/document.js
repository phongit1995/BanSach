const itemsModel = require(__pathSchemas + 'document');
const stringHelper = require(__pathHelper +'string');
const fs = require('fs');
const fileHelper = require(__pathHelper + 'file');
const uploadFolder = 'public/uploads/documents/'

module.exports = {
    listItems: (params, options = null) => {
        let objWhere = {};
        let sort = {};
        sort[params.sortField] = params.sortType;
        if(params.category_id != 'allvalue' && params.category_id != '') {
            objWhere["category.id"]= params.category_id;
        }
        if (params.curStatus !== 'all') {
            objWhere.status = params.curStatus;
        }
        if (params.keyword !== '') {
            objWhere.name = new RegExp(params.keyword, 'i');
        }
        return itemsModel.find(objWhere)
            .select('name status special ordering created modified category.name thumb slug pdf content download')
            .sort(sort)
            .limit(params.pagination.totalItemsPerPage)
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage);
    },
    getItem: (id, options = null) => {
        return itemsModel.findById(id);
    },
    countItem: (params) => {
        let objWhere = {};
        let sort = {};
        if (params.curStatus !== 'all') {
            objWhere.status = params.curStatus;
        }
        if (params.keyword !== '') {
            objWhere.name = new RegExp(params.keyword, 'i');
        }
        return itemsModel.countDocuments(objWhere);
    },
    changeStatus: (id, curStatus, options = null) => {
        // active | inactive
        let status = (curStatus === 'active') ? 'inactive' : 'active';
        let data = {
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        if (options.task == "update_one") {
            data.status = status;
            return itemsModel.updateOne({ _id: id }, data);
        }
        if (options.task == "update_multi") {
            data.status = curStatus;
            return itemsModel.updateMany({ _id: { $in: id } }, data);
        }
    },
    changeSpecial: (id, curSpecial, options = null) =>{
        let special = (curSpecial === 'active') ? 'inactive' : 'active';
        let data = {
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        if (options.task == "update_one") {
            data.special = special;
            return itemsModel.updateOne({ _id: id }, data);
        }
        if (options.task == "update_multi") {
            data.special = curSpecial;
            return itemsModel.updateMany({ _id: { $in: id } }, data);
        }
    },
    changeOrdering: async (cids, orderings , options = null) => {
        let data = {
            ordering: parseInt(orderings),
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        if (Array.isArray(cids)) {
            for(let index = 0; index < cids.length; index++ ) {
                data.ordering = parseInt(orderings[index]);
                await itemsModel.updateOne({ _id: cids[index]}, data);
            }
            return Promise.resolve("Success");
        } else {
            return itemsModel.updateOne({ _id: cids }, data);
        }
    },
    deleteItem: async (id, options = null) => {
        if(options.task == "delete-one") {
            // xoá ảnh đại diện
            await itemsModel.findById(id).then((item) => {
                fileHelper.remove(uploadFolder, item.thumb);
            })
            return itemsModel.deleteOne({_id: id});
        }
        if(options.task == "delete-multi") {
            if(Array.isArray(id)){
                for(let i = 0; i < id.length; i++) {
                    await itemsModel.findById(id[i]).then((item) => {
                        fileHelper.remove(uploadFolder, item.thumb);
                    })
                }
            } else {
                await itemsModel.findById(id).then((item) => {
                    fileHelper.remove(uploadFolder, item.thumb);
                })
            }
            return itemsModel.deleteMany({_id: {$in: id}});
        }
    },
    saveItem: (item, options = null) => {
        if(options.task == "edit") {
            return itemsModel.updateOne({_id: item.id}, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                special: item.special,
                content: item.content,
                modified:{
                    user_id: 0,
                    user_name: "admin",
                    time: Date.now()
                },
                category:{
                    id: item.category_id,
                    name: item.category_name
                },
                thumb: item.thumb,
                slug: stringHelper.createAlias(item.slug),
            });
        }
        if(options.task == "add") {
            item.created = {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
            item.modified = {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
            item.category = {
                id: item.category_id,
                name: item.category_name
            }
            item.slug = stringHelper.createAlias(item.slug);
            item.counts = 0;
            item.download = 0;
            return new itemsModel(item).save();
        }
        if(options.task == "change-category-name") {
            return itemsModel.updateMany({"category.id": item.id}, {
                category: {
                    id:item.id,
                    name: item.name
                }
            });
        }
    },
    // FRONTEND
    listItemsFrontend: (params = null, options = null) => {
        let find = {};
        let select = 'name created.user_name created.time category.name thumb slug';
        let limit = 3;
        let sort = '';
        if(options.task == 'items-special') {
            select = 'name created.time category.name thumb content slug';
            find = {status: 'active', special:'active'};
            sort = {ordering: 'asc'};
            limit = 7;
        }
        if (options.task == 'items-news') {
            select = 'name created.user_name created.time category.name thumb slug content';
            find = {status: 'active'};
            sort = {'created.time' : 'desc'};
            limit = 4;
        }
        if (options.task == 'items-top-views') {
            select = 'name created.user_name created.time category.name thumb slug content';
            find = {status: 'active'};
            sort = {'counts' : 'desc'};
            limit = 4;
        }
        return itemsModel.find(find)
            .select(select)
            .limit(limit)
            .sort(sort);
    },
    getItemFrontend: (id, options = null) => {
        return itemsModel.findById(id)
            .select('name thumb status created content category thumb pdf counts slug download');
    },
    updateCounts: (id, data) => {
         return itemsModel.updateOne({ _id: id }, data);
    }
}
