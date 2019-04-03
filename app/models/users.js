const itemsModel = require(__pathSchemas + 'users');
const fs = require('fs');
const fileHelper = require(__pathHelper + 'file');
const uploadFolder = 'public/uploads/users/'
module.exports = {
    listItems: (params, options = null) => {
        let objWhere = {};
        let sort = {};
        sort[params.sortField] = params.sortType;
        if(params.group_id != 'allvalue' && params.group_id != '') {
            objWhere["group.id"]= params.group_id;
        } 
        if (params.curStatus !== 'all') {
            objWhere.status = params.curStatus;
        }
        if (params.keyword !== '') {
            objWhere.name = new RegExp(params.keyword, 'i');
        }
        return itemsModel.find(objWhere)
            .select('name status ordering created modified group.name avatar')
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
                fileHelper.remove(uploadFolder, item.avatar);
            })
            return itemsModel.deleteOne({_id: id});
        } 
        if(options.task == "delete-multi") {
            if(Array.isArray(id)){
                for(let i = 0; i < id.length; i++) {
                    await itemsModel.findById(id[i]).then((item) => {
                        fileHelper.remove( uploadFolder, item.avatar);
                    })
                }
            } else {
                await itemsModel.findById(id).then((item) => {
                    fileHelper.remove(uploadFolder, item.avatar);
                })
            }
            return itemsModel.deleteMany({_id: {$in: id}});
        }
    },
    saveItem: (item, options = null) => {
        var newUser = new itemsModel();
        item.password = newUser.generateHash(item.password);
        if(options.task == "edit") {
            return itemsModel.updateOne({_id: item.id}, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                content: item.content,
                modified:{
                    user_id: 0,
                    user_name: "admin",
                    time: Date.now()
                },
                group:{
                    id: item.group_id,
                    name: item.group_name
                },
                local: {
                    username: item.username,
                    password: item.password
                },
                avatar: item.avatar
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
            item.group = {
                id: item.group_id,
                name: item.group_name
            }
            item.local = {
                username: item.username,
                password: item.password
            }

            return new itemsModel(item).save();
        }
        if(options.task == "change-group-name") {
            return itemsModel.updateMany({"group.id": item.id}, {
                group: {
                    id:item.id,
                    name: item.name
                }
            });
        } 
    }
}
