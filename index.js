const express = require("express");
const cors = require("cors");

const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Employee = require("./db/employee");
const Project = require('./db/project'); // Import your Mongoose model
const Task = require("./db/task");
require('./db/config');
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://pratyushsharma1404:pratyush@dbetms.5zp5afe.mongodb.net/db_etms?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindandModify: false
}).then(() => {
    console.log('connection successful');
}).catch((err) => console.log('no connection'));

const employeeSchema = new mongoose.Schema({
  // The empId field will be auto-incremented
  name: String,
  email: String,
  phone: String,
  password: String,
  deptId: String,
  designation: String,
  managerId: Number,
  role: String,
});

 
// Associate the schema with the auto-increment plugin
employeeSchema.plugin(AutoIncrement, { inc_field: 'empId' });

const EmployeeModel = mongoose.model("Employee", employeeSchema);

app.post("/signin", async (req, res) => {
  try {
    const { password, email } = req.body;
    if (password && email) {
      const employee = await EmployeeModel.findOne({ email, password }).select("-password");
      if (employee) {
        return res.status(200).json(employee);
      }
      else{
        return res.status(201).json({ result: "No User Found" });
      }
      
    } else {
      return res.status(400).json({ error: "Missing email or password" });
    }
  } catch (error) {
    console.error("Error signing in:", error);
    res.status(500).json({ status: "error", message: "Failed to sign in" });
  }
});


app.post("/admin/add_employee", async (req, res) => {
  try {
    const newEmployeeData = req.body;

    // Generate a random password
    const randomPassword = generateRandomPassword();
    newEmployeeData.password = randomPassword;

    // You can remove the "empId" field, as it will be auto-incremented
    delete newEmployeeData.empId;

    const newEmployee = new EmployeeModel(newEmployeeData);

    await newEmployee.save();

    res.status(200).json({ status: "success", message: "Employee added successfully", data: newEmployee });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ status: "error", message: "Failed to add employee" });
  }
});

// Define the route for changing the project status
app.patch('/manager/projectList/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const newStatus = req.body.status; // Status to update

  // Find the project in your database (using Mongoose or any other database library)
  // Update the project status
  Project.findOneAndUpdate({ projectId }, { status: newStatus }, (err, project) => {
    if (err) {
      return res.status(500).json({ status: 'error', error: 'Failed to update project status' });
    }
    return res.json({ status: 'success', message: 'Project status updated successfully' });
  });
});


// Function to generate a random password
function generateRandomPassword() {
  // Define a character set for the password
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";

  // Generate a random 8-character password
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}

app.get('/manager/projectList/:deptId', async (req, res) => {
  try {
    const deptId = req.params.deptId;
    const projects = await Project.find({ deptId });

    if (!projects) {
      return res.status(404).json({ status: 'error', error: 'No projects found' });
    }

    res.status(200).json({ status: 'success', data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch projects' });
  }
});


app.get("/admin/employeeProfile/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;
    const employee = await EmployeeModel.findOne({ empId }).select("-password");

    if (!employee) {
      return res.status(404).json({ status: "error", error: "Employee not found" });
    }

    res.status(200).json({ status: "success", data: employee });
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    res.status(500).json({ status: "error", error: "Failed to fetch employee profile" });
  }
});

app.put("/admin/editEmployee/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;
    const updatedData = req.body;

    // Find the employee by empId and update their information
    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
      { empId: empId },
      updatedData,
      { new: true } // { new: true } returns the updated employee
    );

    if (!updatedEmployee) {
      return res.status(404).json({ status: "error", error: "Employee not found" });
    }

    res.status(200).json({ status: "success", data: updatedEmployee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ status: "error", error: "Failed to update employee" });
  }
});

app.put("/admin/editEmployee/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;
    const updatedData = req.body;

    // Check if the provided empId is valid and data is not empty
    if (!empId || !updatedData) {
      return res.status(400).json({ status: "error", error: "Invalid request data" });
    }

    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
      { empId: empId },
      updatedData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ status: "error", error: "Employee not found" });
    }

    return res.status(200).json({ status: "success", data: updatedEmployee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ status: "error", error: "Failed to update employee" });
  }
});



// Inside your route handler
app.post('/manager/createProject', async (req, res) => {
  try {
    const {
      projectName,
      projectId,
      deptId,
      startDate,
      dueDate,
      projectDescription,
      userId
    } = req.body;

    const project = new Project({
      projectName,
      projectId,
      deptId,
      startDate,
      dueDate,
      projectDescription,
      userId
    });

    await project.save(); // Save the project to the database

    res.status(201).json({ status: 'success', message: 'New project created' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Failed to create the project' });
  }
});


app.get("/employeeProfile/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;
    const employee = await EmployeeModel.findOne({ empId });
    
    if (!employee) {
      return res.status(404).json({ status: "error", error: "Employee not found" });
    }
    
    res.status(200).json({ status: "success", data: employee });
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    res.status(500).json({ status: "error", error: "Failed to fetch employee profile" });
  }
});



app.put("/employeeUpdate/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;
    const updatedData = req.body;

    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
      { empId: empId },
      updatedData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ status: "error", error: "Employee not found" });
    }

    res.status(200).json({ status: "success", data: updatedEmployee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ status: "error", error: "Failed to update employee" });
  }
});

app.delete("/admin/deleteEmployee/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;

    const deletedEmployee = await EmployeeModel.findOneAndRemove({ empId: empId });

    if (!deletedEmployee) {
      return res.status(404).json({ status: "error", error: "Employee not found" });
    }

    res.status(200).json({ status: "success", message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ status: "error", message: "Failed to delete employee" });
  }
});

app.get("/admin/list_employees", async (req, res) => {
  try {
    const employees = await EmployeeModel.find({}, "-password");
    res.status(200).json({ status: "success", data: employees });
  } catch (error) {
    console.error("Error listing employees:", error);
    res.status(500).json({ status: "error", error: "Failed to list employees" });
  }
});

app.patch("/employeeUpdate/:empId", async (req, res) => {
  try {
    const empId = req.params.empId;
    const updatedPassword = req.body.password;

    const employee = await EmployeeModel.findOne({ empId });

    if (!employee) {
      return res.status(404).json({ status: "error", error: "Employee not found" });
    }

    // Update the employee's password
    employee.password = updatedPassword;
    await employee.save();

    return res.status(200).json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating employee password:", error);
    res.status(500).json({ status: "error", error: "Failed to update employee password" });
  }
});

app.post('/manager/addTask', async (req, res) => {
  try {
    const {
      taskName,
      taskId,
      projectId,
      startDate,
      dueDate,
      description,
      empId,
    } = req.body;

    // Set the initial status to "In-progress"
    const status = "In-progress";

    // Create a new task based on the provided data, including the status
    const task = new Task({
      taskName,
      taskId,
      projectId,
      startDate,
      dueDate,
      description,
      empId,
      status, // Set the initial status to "In-progress"
    });

    // Save the task to the database
    await task.save();

    res.status(201).json({ status: 'success', message: 'New task added' });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ status: 'error', error: 'Failed to add the task' });
  }
});

// Define the route for fetching employees for task assignment based on department
app.get('/manager/assignTask/:deptId', async (req, res) => {
  try {
    const deptId = req.params.deptId;
    
    // Retrieve employees from the database based on the department ID
    const employees = await EmployeeModel.find({ deptId });
    
    if (!employees) {
      return res.status(404).json({ status: 'error', error: 'No employees found' });
    }
    
    res.status(200).json({ status: 'success', data: employees });
  } catch (error) {
    console.error('Error fetching employees for task assignment:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch employees for task assignment' });
  }
});

// GET unassigned tasks
app.get('/manager/unassignedTasks', (req, res) => {
  // Fetch tasks where empId is not set
  Task.find({ empId: null }, (err, tasks) => {
    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }
    return res.json({ status: 'success', data: tasks });
  });
});

// Inside your route handler
app.patch('/manager/assignTask/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { status, employee } = req.body;
    const empId = employee.empId;

    // Update the task in your database by setting its empId to the selected employee's empId
    const updatedTask = await Task.findOneAndUpdate({ taskId }, { empId, status });

    if (!updatedTask) {
      return res.status(404).json({ status: 'error', error: 'Task not found' });
    }

    res.status(200).json({ status: 'success', message: `Task ${updatedTask.taskName} assigned to employee with ID ${empId}` });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ status: 'error', error: 'Failed to assign the task' });
  }
});

// Inside your route handler
app.get('/employee/:empId', async (req, res) => {
  try {
    const empId = req.params.empId;
    
    // Fetch tasks where the empId matches the provided empId
    const tasks = await Task.find({ empId });

    if (!tasks) {
      return res.status(404).json({ status: 'error', error: 'No tasks found for this employee' });
    }

    res.status(200).json({ status: 'success', data: tasks });
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch employee tasks' });
  }
});

app.patch('/manager/markAsComplete/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    
    // Find the task by taskId in your database
    const task = await Task.findOne({ taskId });

    if (!task) {
      return res.status(404).json({ status: 'error', error: 'Task not found' });
    }

    // Update the task's status to "Completed"
    task.status = 'Completed';
    
    // Save the updated task
    await task.save();

    return res.status(200).json({ status: 'success', message: `Task ${task.taskName} marked as complete` });
  } catch (error) {
    console.error('Error marking task as complete:', error);
    res.status(500).json({ status: 'error', error: 'Failed to mark task as complete' });
  }
});

// Import necessary modules and set up your Express app

// Define a route to mark a task as in progress
app.patch('/manager/markAsInProgress/:taskId', async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findOne({ taskId });

    if (!task) {
      return res.status(404).json({ status: 'error', error: 'Task not found' });
    }

    if (task.status === 'Completed') {
      // Only change the status to 'In Progress' if it was previously 'Completed'
      const updatedTask = await Task.findOneAndUpdate({ taskId }, { status: 'In Progress' });

      if (!updatedTask) {
        return res.status(500).json({ status: 'error', error: 'Failed to update task' });
      }

      return res.json({ status: 'success' });
    } else {
      return res.status(400).json({ status: 'error', error: 'Task is not in "Completed" state' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

// Start your Express server


app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
