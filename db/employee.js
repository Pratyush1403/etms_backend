const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    empId: Number,
    designation: String,
    email: String,
    managerId: Number,
    name: String,
    password: String,
    phone: String,
    role: String,
    deptId: Number
});

module.exports = mongoose.model("employee", employeeSchema);