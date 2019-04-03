const databaseConfig = require(__pathConfig + 'database')
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
                name: String, 
                status: String,
                slug: String,
                special: String,
                ordering: Number,
                content: String,
                thumb: String,
                category:{
                    id:String,
                    name: String
                },
                created:{
                    user_id: Number,
                    user_name: String,
                    time: Date
                },
                modified:{
                    user_id: Number,
                    user_name: String,
                    time: Date
                },
                author: String,
                coverprice: Number,
                price: Number,
                pages: Number,
                pdf: String,
                moreImage: Array
});
module.exports = mongoose.model(databaseConfig.col_articles, schema);