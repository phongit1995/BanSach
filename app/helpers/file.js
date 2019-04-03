var multer = require('multer')
var randomstring = require("randomstring");
var path = require('path');
const fs = require('fs');
const notify = require(__pathConfig + 'notify');


let uploadFile = (field, folderDes = 'users', fileNameLength = 10, fileSizeMb = 1, fileExtension = 'jpeg|jpg|png|gif') => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __pathUploads + folderDes + "/");
        },
        filename: (req, file, cb) => {
            cb(null, randomstring.generate(fileNameLength) + path.extname(file.originalname));
        }
    })

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: fileSizeMb * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const filetypes = new RegExp(fileExtension);  
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // check extension file upload(Reg)
            const mimetype = filetypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(notify.ERROR_FILE_EXTENSION);
            }
        }
    }).single(field);
    return upload
}
let removeFile = (folder, filename) => {
    if (filename != '' && filename != undefined) {
        let path = folder + filename;
        if (fs.existsSync(path)) {
            fs.unlink(path, (err) => {
                if (err) throw err;
            });
        }
    }

}
module.exports = {
    upload: uploadFile,
    remove: removeFile
}