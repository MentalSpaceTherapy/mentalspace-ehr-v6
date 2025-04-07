const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Task = require('../models/Task');
const Staff = require('../models/Staff');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Contact = require('../models/Contact');
const Campaign = require('../models/Campaign');
const Appointment = require('../models/Appointment');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all tasks
// @route     GET /api/v1/tasks
// @access    Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single task
// @route     GET /api/v1/tasks/:id
// @access    Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate({
      path: 'assignedTo',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'relatedTo.id',
      select: 'firstName lastName email title name',
      model: function(doc) {
        return doc.relatedTo.model;
      }
    });

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CRM',
    resourceId: task._id,
    description: `Accessed task: ${task.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc      Create new task
// @route     POST /api/v1/tasks
// @access    Private
exports.createTask = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  // Check if assigned staff exists
  if (req.body.assignedTo) {
    const staff = await Staff.findById(req.body.assignedTo);
    if (!staff) {
      return next(
        new ErrorResponse(`Staff not found with id of ${req.body.assignedTo}`, 404)
      );
    }
  }

  // Validate related entity if provided
  if (req.body.relatedTo && req.body.relatedTo.model !== 'None' && req.body.relatedTo.id) {
    let model;
    switch (req.body.relatedTo.model) {
      case 'Lead':
        model = Lead;
        break;
      case 'Client':
        model = Client;
        break;
      case 'Contact':
        model = Contact;
        break;
      case 'Campaign':
        model = Campaign;
        break;
      case 'Appointment':
        model = Appointment;
        break;
      default:
        return next(
          new ErrorResponse(`Invalid related model: ${req.body.relatedTo.model}`, 400)
        );
    }

    const entity = await model.findById(req.body.relatedTo.id);
    if (!entity) {
      return next(
        new ErrorResponse(`${req.body.relatedTo.model} not found with id of ${req.body.relatedTo.id}`, 404)
      );
    }
  }

  const task = await Task.create(req.body);

  // If task is related to an entity, add task to that entity
  if (task.relatedTo.model !== 'None' && task.relatedTo.id) {
    let model;
    switch (task.relatedTo.model) {
      case 'Lead':
        model = Lead;
        break;
      case 'Client':
        model = Client;
        break;
      case 'Contact':
        model = Contact;
        break;
      case 'Campaign':
        model = Campaign;
        break;
      default:
        // Appointment doesn't have tasks array
        break;
    }

    if (model) {
      await model.findByIdAndUpdate(
        task.relatedTo.id,
        { $push: { tasks: task._id } }
      );
    }
  }

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CRM',
    resourceId: task._id,
    description: `Created task: ${task.title}`,
    req
  });

  res.status(201).json({
    success: true,
    data: task
  });
});

// @desc      Update task
// @route     PUT /api/v1/tasks/:id
// @access    Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update the task
  if (task.assignedTo.toString() !== req.user.id && 
      task.createdBy.toString() !== req.user.id && 
      req.user.role !== 'PRACTICE_ADMIN' && 
      req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this task`, 403)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  // Check if assigned staff exists
  if (req.body.assignedTo) {
    const staff = await Staff.findById(req.body.assignedTo);
    if (!staff) {
      return next(
        new ErrorResponse(`Staff not found with id of ${req.body.assignedTo}`, 404)
      );
    }
  }

  // If status is being changed to Completed, set completedDate
  if (req.body.status === 'Completed' && task.status !== 'Completed') {
    req.body.completedDate = Date.now();
  }

  // If status is being changed from Completed, clear completedDate
  if (req.body.status && req.body.status !== 'Completed' && task.status === 'Completed') {
    req.body.completedDate = null;
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: task._id,
    description: `Updated task: ${task.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc      Delete task
// @route     DELETE /api/v1/tasks/:id
// @access    Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to delete the task
  if (task.createdBy.toString() !== req.user.id && 
      req.user.role !== 'PRACTICE_ADMIN' && 
      req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this task`, 403)
    );
  }

  // If task is related to an entity, remove task from that entity
  if (task.relatedTo.model !== 'None' && task.relatedTo.id) {
    let model;
    switch (task.relatedTo.model) {
      case 'Lead':
        model = Lead;
        break;
      case 'Client':
        model = Client;
        break;
      case 'Contact':
        model = Contact;
        break;
      case 'Campaign':
        model = Campaign;
        break;
      default:
        // Appointment doesn't have tasks array
        break;
    }

    if (model) {
      await model.findByIdAndUpdate(
        task.relatedTo.id,
        { $pull: { tasks: task._id } }
      );
    }
  }

  await task.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CRM',
    resourceId: task._id,
    description: `Deleted task: ${task.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Add subtask to task
// @route     POST /api/v1/tasks/:id/subtasks
// @access    Private
exports.addSubtask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update the task
  if (task.assignedTo.toString() !== req.user.id && 
      task.createdBy.toString() !== req.user.id && 
      req.user.role !== 'PRACTICE_ADMIN' && 
      req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this task`, 403)
    );
  }

  // Validate subtask data
  if (!req.body.title) {
    return next(
      new ErrorResponse('Please provide a title for the subtask', 400)
    );
  }

  // Add subtask to task
  task.subtasks.push({
    title: req.body.title,
    completed: req.body.completed || false,
    completedDate: req.body.completed ? Date.now() : undefined
  });

  task.updatedBy = req.user.id;
  task.updatedAt = Date.now();

  await task.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: task._id,
    description: `Added subtask to task: ${task.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc      Update subtask
// @route     PUT /api/v1/tasks/:id/subtasks/:subtaskId
// @access    Private
exports.updateSubtask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update the task
  if (task.assignedTo.toString() !== req.user.id && 
      task.createdBy.toString() !== req.user.id && 
      req.user.role !== 'PRACTICE_ADMIN' && 
      req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this task`, 403)
    );
  }

  // Find subtask
  const subtaskIndex = task.subtasks.findIndex(
    subtask => subtask._id.toString() === req.params.subtaskId
  );

  if (subtaskIndex === -1) {
    return next(
      new ErrorResponse(`Subtask not found with id of ${req.params.subtaskId}`, 404)
    );
  }

  // Update subtask
  if (req.body.title) {
    task.subtasks[subtaskIndex].title = req.body.title;
  }

  if (req.body.completed !== undefined) {
    task.subtasks[subtaskIndex].completed = req.body.completed;
    
    // Update completedDate based on completed status
    if (req.body.completed) {
      task.subtasks[subtaskIndex].completedDate = Date.now();
    } else {
      task.subtasks[subtaskIndex].completedDate = undefined;
    }
  }

  task.updatedBy = req.user.id;
  task.updatedAt = Date.now();

  await task.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: task._id,
    description: `Updated subtask in task: ${task.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc      Delete subtask
// @route     DELETE /api/v1/tasks/:id/subtasks/:subtaskId
// @access    Private
exports.deleteSubtask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update the task
  if (task.assignedTo.toString() !== req.user.id && 
      task.createdBy.toString() !== req.user.id && 
      req.user.role !== 'PRACTICE_ADMIN' && 
      req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this task`, 403)
    );
  }

  // Find subtask
  const subtaskIndex = task.subtasks.findIndex(
    subtask => subtask._id.toString() === req.params.subtaskId
  );

  if (subtaskIndex === -1) {
    return next(
      new ErrorResponse(`Subtask not found with id of ${req.params.subtaskId}`, 404)
    );
  }

  // Remove subtask
  task.subtasks.splice(subtaskIndex, 1);
  task.updatedBy = req.user.id;
  task.updatedAt = Date.now();

  await task.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: task._id,
    description: `Deleted subtask from task: ${task.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc      Get task statistics
// @route     GET /api/v1/tasks/stats
// @access    Private
exports.getTaskStats = asyncHandler(async (req, res, next) => {
  // Get counts by status
  const statusCounts = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get counts by priority
  const priorityCounts = await Task.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get counts by type
  const typeCounts = await Task.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get overdue tasks count
  const now = new Date();
  const overdueTasks = await Task.countDocuments({
    dueDate: { $lt: now },
    status: { $ne: 'Completed' }
  });

  // Get tasks due today count
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));
  
  const tasksDueToday = await Task.countDocuments({
    dueDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'Completed' }
  });

  // Get tasks by assignee
  const tasksByAssignee = await Task.aggregate([
    {
      $match: {
        status: { $ne: 'Completed' }
      }
    },
    {
      $group: {
        _id: '$assignedTo',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Populate assignee names
  for (const item of tasksByAssignee) {
    if (item._id) {
      const staff = await Staff.findById(item._id).select('firstName lastName');
      if (staff) {
        item.name = `${staff.firstName} ${staff.lastName}`;
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      total: await Task.countDocuments(),
      completed: await Task.countDocuments({ status: 'Completed' }),
      overdue: overdueTasks,
      dueToday: tasksDueToday,
      statusCounts,
      priorityCounts,
      typeCounts,
      tasksByAssignee
    }
  });
});
