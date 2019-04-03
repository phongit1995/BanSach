const notify        = require(__pathConfig + 'notify');
module.exports = {
    validator: (req, errUpload,  taskCurrent)=>{
        let errors = req.validationErrors() != false ? req.validationErrors() : [];
        if (errUpload) {
            if(errUpload.code == 'LIMIT_FILE_SIZE') {
                errUpload = notify.ERROR_FILE_LIMIT;
            }
            errors.push({ param: 'Pdf Upload', msg: errUpload });
        } else {
            if(req.file == undefined && taskCurrent == 'add') {
                errors.push({param: 'Pdf Upload', msg: notify.ERROR_FILE_REQUIRE});
            }
        }
        return errors;
    }
}