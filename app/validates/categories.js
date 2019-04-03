const notify        = require(__pathConfig + 'notify');
const util          = require('util');
const options = {
    name: {min: 2, max: 30},
    ordering: {min: 0, max: 100},
    status: {value: "novalue"},
    content: {min: 1, max: 200},
    slug: {min: 2, max: 100},
    
}
module.exports = {
    validator: (req)=>{
        req.checkBody('name',util.format(notify.ERROR_NAME, options.name.min, options.name.max)).isLength({min:options.name.min, max: options.name.max});
        req.checkBody('slug',util.format(notify.ERROR_NAME, options.slug.min, options.slug.max)).isLength({min:options.slug.min, max: options.slug.max});
        req.checkBody('ordering',   util.format(notify.ERROR_ORDERING, options.ordering.min, options.ordering.max) ).isInt({gt: options.ordering.min, lt:options.ordering.max});
        req.checkBody('status', notify.ERROR_STATUS).isNotEqual(options.status.value)
        req.checkBody('content',util.format(notify.ERROR_NAME, options.name.min, options.name.max)).isLength({min:options.content.min, max: options.content.max});
        let errors = req.validationErrors() != false ? req.validationErrors() : [];
        //do validate
        return errors;
    }
}