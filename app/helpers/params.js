/* ------------------------------------------------------------------------------
 * Hàm thiết lập đường dẫn mặc định khi mới vào trang (all | active | inactive)
 --------------------------------------------------------------------------------*/
let getParam = (params, property, defaultValue) =>{
    if(params.hasOwnProperty(property) && params[property] != undefined){
        return params[property];
    }
    return defaultValue;
}
module.exports = {
    getParam: getParam
}