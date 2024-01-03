const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskName: String,
  taskId: Number,
  projectId: Number,
  startDate: Date,
  dueDate: Date,
  description: String,
  empId: String,
  status: String
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;