/* ------------------------------------------------------------------------------
 * Hàm thiết lập status và số lượng 
 --------------------------------------------------------------------------------*/

let createFilterStatus = async (curStatus, collection) => {
    const Model = require(__pathSchemas + collection);
    let statusFilter = [
        { name: "All", value: "all", count: 0, link: "<%%>", class: "default" },
        { name: "Active", value: "active", count: 0, link: "#", class: "default" },
        { name: "InActive", value: "inactive", count: 0, link: "#", class: "default" },
    ]
    //Vấn đề là có những lúc count không đúng (sử lý lại) => khắc phục sau 
    //Giải quyết do async không dùng được với forEach nên phải dùng for
    for(let index = 0; index < statusFilter.length; index++){
        let item = statusFilter[index];
        let condition = {};
        if (item.value !== 'all') {
            condition = { status: item.value }
        }
        if (item.value === curStatus) {
            statusFilter[index].class = 'success';
        }
        await Model.countDocuments(condition).then((data) => {
            statusFilter[index].count = data;
        })

    }
    return statusFilter;
}
module.exports = {
    createFilterStatus: createFilterStatus
}