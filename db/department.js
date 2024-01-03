const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    deptId: Number,
    deptName: String,
    managerId: Number
});

module.exports = mongoose.model("department", departmentSchema);