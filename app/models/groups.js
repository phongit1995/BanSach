const groupsModel = require(__pathSchemas + 'groups');
module.exports = {
    listItems: (params, options = null) => {
        let objWhere = {};
        let sort = {};
        sort[params.sortField] = params.sortType;
        if (params.curStatus !== 'all') {
            objWhere.status = params.curStatus;
        }
        if (params.keyword !== '') {
            objWhere.name = new RegExp(params.keyword, 'i');
        }
        return groupsModel.find(objWhere)
            .select('name status ordering created modified group_acp')
            .sort(sort)
            .limit(params.pagination.totalItemsPerPage)
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage);
    },
    listItemsInSelectBox: (params, options = null) => {
        return groupsModel.find({}, {_id:1, name:1});
    },
    getItem: (id, options = null) => {
        return groupsModel.findById(id);
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
        return groupsModel.countDocuments(objWhere);
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
            return groupsModel.updateOne({ _id: id }, data);
        }
        if (options.task == "update_multi") {
            data.status = curStatus;
            return groupsModel.updateMany({ _id: { $in: id } }, data);
        }
    },
    changeOrdering: async (cids, orderings, options = null) => {
        let data = {
            ordering: parseInt(orderings),
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        if (Array.isArray(cids)) {
            for (let index = 0; index < cids.length; index++) {
                data.ordering = parseInt(orderings[index]);
                await groupsModel.updateOne({ _id: cids[index] }, data);
            }
            return Promise.resolve("Success");
        } else {
            return groupsModel.updateOne({ _id: cids }, data);
        }
    },
    deleteItem: (id, options = null) => {
        if (options.task == "delete-one") {
            return groupsModel.deleteOne({ _id: id });
        }
        if (options.task == "delete-multi") {
            return groupsModel.remove({ _id: { $in: id } });
        }
    },
    saveItem: (item, options = null) => {
        if (options.task == "edit") {
            return groupsModel.updateOne({ _id: item.id }, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                content: item.content,
                group_acp: item.group_acp,
                modified: {
                    user_id: 0,
                    user_name: "admin",
                    time: Date.now()
                }
            });
        }
        if (options.task == "add") {
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
            return new groupsModel(item).save();
        }

    },
    changeGroupAcp: (curGroupAcp, id, options = null) => {
        let groupAcp = (curGroupAcp === 'yes') ? 'no' : 'yes';
        let data = {
            group_acp: groupAcp,
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        return  groupsModel.updateOne({ _id: id }, data);
    }
}
