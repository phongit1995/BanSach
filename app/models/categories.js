const categoriesModel = require(__pathSchemas + 'categories');
const stringHelper = require(__pathHelper +'string');
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
        return categoriesModel.find(objWhere)
            .select('name status ordering created modified slug')
            .sort(sort)
            .limit(params.pagination.totalItemsPerPage)
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage);
    },
    listItemsInSelectBox: (params, options = null) => {
        return categoriesModel.find({}, {_id:1, name:1});
    },
    getItem: (id, options = null) => {
        return categoriesModel.findById(id);
    },
    countItem: (params) => {
        let objWhere = {};
        if (params.curStatus !== 'all') {
            objWhere.status = params.curStatus;
        }
        if (params.keyword !== '') {
            objWhere.name = new RegExp(params.keyword, 'i');
        }
        return categoriesModel.countDocuments(objWhere);
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
            return categoriesModel.updateOne({ _id: id }, data);
        }
        if (options.task == "update_multi") {
            data.status = curStatus;
            return categoriesModel.updateMany({ _id: { $in: id } }, data);
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
                await categoriesModel.updateOne({ _id: cids[index] }, data);
            }
            return Promise.resolve("Success");
        } else {
            return categoriesModel.updateOne({ _id: cids }, data);
        }
    },
    deleteItem: (id, options = null) => {
        if (options.task == "delete-one") {
            return categoriesModel.deleteOne({ _id: id });
        }
        if (options.task == "delete-multi") {
            return categoriesModel.remove({ _id: { $in: id } });
        }
    },
    saveItem: (item, options = null) => {
        if (options.task == "edit") {
            return categoriesModel.updateOne({ _id: item.id }, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                content: item.content,
                slug: stringHelper.createAlias(item.slug), // chuan hoa 
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
            item.slug = stringHelper.createAlias(item.slug); // chuan hoa 
            return new categoriesModel(item).save();
        }

    },
    listItemsFrontend: (params = null, options = null ) => {
        let find = {};
        let select = 'name ordering created modified slug';
        let limit = 10;
        let sort = '';
        if(options.task == 'items-in-menu') {
            find = {status: 'active'};
            sort = {'ordering': 'asc'};
        }
        return categoriesModel.find(find)
            .select(select)
            .limit(limit)
            .sort(sort);
    }
   
}
