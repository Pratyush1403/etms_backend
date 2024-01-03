
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: String,
  projectId: String,
  deptId: String,
  startDate: Date,
  dueDate: Date,
  projectDescription: String,
  userId: String,
  status: String
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
