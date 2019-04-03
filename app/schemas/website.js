const databaseConfig = require(__pathConfig + 'database')
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    slides: Array,
    mainlogo: String
});
module.exports = mongoose.model(databaseConfig.col_website, schema);