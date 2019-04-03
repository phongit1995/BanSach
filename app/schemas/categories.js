const databaseConfig = require(__pathConfig + 'database')
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
                name: String, 
                status: String,
                ordering: Number,
                content: String,
                slug: String,
                created:{
                    user_id: Number,
                    user_name: String,
                    time: Date
                },
                modified:{
                    user_id: Number,
                    user_name: String,
                    time: Date
                }
            });
module.exports = mongoose.model(databaseConfig.col_categories, schema);