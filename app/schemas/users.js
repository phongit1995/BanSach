const databaseConfig = require(__pathConfig + 'database')
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
                name: String, 
                status: String,
                ordering: Number,
                content: String,
                avatar: String,
                group:{
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
                local            : {
                    username        : String,
                    password     : String,
                },
            });
// phương thực sinh chuỗi hash
schema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// kiểm tra password có hợp lệ không
schema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model(databaseConfig.col_users, schema);