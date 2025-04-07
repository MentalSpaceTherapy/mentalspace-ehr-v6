const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  getTaskStats
} = require('../controllers/tasks');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Task = require('../models/Task');

router
  .route('/')
  .get(
    protect,
    advancedResults(Task, [
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName' },
      { 
        path: 'relatedTo.id',
        select: 'firstName lastName email title name',
        model: function(doc) {
          return doc.relatedTo.model;
        }
      }
    ]),
    getTasks
  )
  .post(protect, createTask);

router
  .route('/stats')
  .get(protect, getTaskStats);

router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router
  .route('/:id/subtasks')
  .post(protect, addSubtask);

router
  .route('/:id/subtasks/:subtaskId')
  .put(protect, updateSubtask)
  .delete(protect, deleteSubtask);

module.exports = router;
