var express = require('express');
var router = express.Router();

const systemConfig = require(__pathConfig + 'system');
const notify = require(__pathConfig + 'notify');
const websiteSchemas = require(__pathSchemas + 'website');
const utilsHelper = require(__pathHelper + 'utils');
const paramsHelper = require(__pathHelper + 'params');
const fileHelper = require(__pathHelper + 'file');
const util = require('util');

const linkIndex = '/' + systemConfig.prefixAdmin + '/website/';
const folderView = __pathViews_Admin + "pages/website/";

const uploadThumb = fileHelper.upload('thumb', 'articles', 10, 1, 'jpeg|jpg|png|gif');
router.get('/',async (req, res) => {
    let item = null;
    await websiteSchemas.findOne().then((result)=>{
        item = result;
    })
    res.render(`${folderView}index`, {
        pageTitle: 'Config Website',
        item
    });
})


var multer  = require('multer')
var randomstring = require("randomstring");
var path = require('path');
const fs = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __pathUploads  + 'website');
    },
    filename: function (req, file, cb) {
        cb(null,randomstring.generate(15) + path.extname(file.originalname));
    }
})
function extFile(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|png|jpeg|gif)$/)) {
        return cb(notify.ERROR_FILE_EXTENSION);
    } else {
        return cb(null, true);
    }
}
const upload = multer({ storage: storage, fileFilter: extFile}).array('file', 12)
router.post('/slides-upload', (req, res) => {
    upload(req, res,async  function (err) {
        if (err instanceof multer.MulterError) {
            console.log('Error');
        } else if (err) {
            console.log('Error');
        } else {
            let item = null;
            await websiteSchemas.findOne().then((result) => {
                item = result
            })
            if(item == null) {
                item = {
                    slides: [],
                    mainlogo: ''
                }
            }
            if(item.slides.length <= 5) {
                item.slides.push(req.files[0].filename)
            }
            await websiteSchemas(item).save().then((item)=> {
                res.status(200).send('success');
            })
        }
    })
})
router.get('/deleteSlide/:image', async (req, res) => {
    let imageName = paramsHelper.getParam(req.params, 'image', '');
    let itemUpdate= null;
    await websiteSchemas.findOne().then((item) => {
        itemUpdate = item;
    })

    for( var i = 0; i < itemUpdate.slides.length; i++){
        if ( itemUpdate.slides[i] === imageName) {
            itemUpdate.slides.splice(i, 1);
        }
    }
    fileHelper.remove(__pathUploads  + 'website/', imageName);
    await websiteSchemas.updateOne({_id: itemUpdate.id}, {slides:  itemUpdate.slides} ).then((item)=>{})

    res.redirect(linkIndex);
})
router.get('/dowloadSlide/:image',async (req, res) => {
    let imageName = paramsHelper.getParam(req.params, 'image', '');
    let imagePath = __pathUploads  + 'website/' + imageName;
    res.download(imagePath);
})
module.exports = router;
