const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const RecurringAppointment = require('../models/RecurringAppointment');
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all recurring appointments
// @route     GET /api/v1/recurring-appointments
// @access    Private
exports.getRecurringAppointments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get recurring appointments for a specific client
// @route     GET /api/v1/clients/:clientId/recurring-appointments
// @access    Private
exports.getClientRecurringAppointments = asyncHandler(async (req, res, next) => {
  const recurringAppointments = await RecurringAppointment.find({ 
    client: req.params.clientId,
    status: 'Active'
  })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .sort({ startDate: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'APPOINTMENT',
    description: `Accessed recurring appointments for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: recurringAppointments.length,
    data: recurringAppointments
  });
});

// @desc      Get recurring appointments for a specific provider
// @route     GET /api/v1/staff/:providerId/recurring-appointments
// @access    Private
exports.getProviderRecurringAppointments = asyncHandler(async (req, res, next) => {
  const recurringAppointments = await RecurringAppointment.find({ 
    provider: req.params.providerId,
    status: 'Active'
  })
    .populate({
      path: 'client',
      select: 'firstName lastName'
    })
    .sort({ startDate: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'APPOINTMENT',
    description: `Accessed recurring appointments for provider ID: ${req.params.providerId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: recurringAppointments.length,
    data: recurringAppointments
  });
});

// @desc      Get single recurring appointment
// @route     GET /api/v1/recurring-appointments/:id
// @access    Private
exports.getRecurringAppointment = asyncHandler(async (req, res, next) => {
  const recurringAppointment = await RecurringAppointment.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName phone email'
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .populate('generatedAppointments');

  if (!recurringAppointment) {
    return next(
      new ErrorResponse(`Recurring appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'APPOINTMENT',
    resourceId: recurringAppointment._id,
    description: `Accessed recurring appointment details for ${recurringAppointment.client.firstName} ${recurringAppointment.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: recurringAppointment
  });
});

// @desc      Create recurring appointment
// @route     POST /api/v1/recurring-appointments
// @access    Private
exports.createRecurringAppointment = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.body.client);
  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.body.client}`, 404)
    );
  }

  // Check if provider exists
  const provider = await Staff.findById(req.body.provider);
  if (!provider) {
    return next(
      new ErrorResponse(`Provider not found with id of ${req.body.provider}`, 404)
    );
  }

  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const recurringAppointment = await RecurringAppointment.create(req.body);

  // Generate initial appointments based on recurrence pattern
  const generatedAppointments = await generateAppointments(recurringAppointment, req.user.id);
  
  // Update recurring appointment with generated appointments
  await RecurringAppointment.findByIdAndUpdate(
    recurringAppointment._id,
    { generatedAppointments: generatedAppointments.map(appt => appt._id) }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'APPOINTMENT',
    resourceId: recurringAppointment._id,
    description: `Created recurring appointment for ${client.firstName} ${client.lastName} with ${provider.firstName} ${provider.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: recurringAppointment,
    generatedCount: generatedAppointments.length
  });
});

// @desc      Update recurring appointment
// @route     PUT /api/v1/recurring-appointments/:id
// @access    Private
exports.updateRecurringAppointment = asyncHandler(async (req, res, next) => {
  let recurringAppointment = await RecurringAppointment.findById(req.params.id);

  if (!recurringAppointment) {
    return next(
      new ErrorResponse(`Recurring appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;
  req.body.updatedAt = Date.now();

  recurringAppointment = await RecurringAppointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'APPOINTMENT',
    resourceId: recurringAppointment._id,
    description: `Updated recurring appointment ID: ${recurringAppointment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: recurringAppointment
  });
});

// @desc      Cancel recurring appointment
// @route     PUT /api/v1/recurring-appointments/:id/cancel
// @access    Private
exports.cancelRecurringAppointment = asyncHandler(async (req, res, next) => {
  let recurringAppointment = await RecurringAppointment.findById(req.params.id)
    .populate('generatedAppointments');

  if (!recurringAppointment) {
    return next(
      new ErrorResponse(`Recurring appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate request
  if (!req.body.reason) {
    return next(
      new ErrorResponse('Please provide cancellation reason', 400)
    );
  }

  // Update recurring appointment
  recurringAppointment = await RecurringAppointment.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Cancelled',
      notes: req.body.reason,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Cancel all future appointments
  const now = new Date();
  const futureAppointments = recurringAppointment.generatedAppointments.filter(
    appt => new Date(appt.startTime) > now
  );

  for (const appointment of futureAppointments) {
    await Appointment.findByIdAndUpdate(
      appointment._id,
      {
        status: 'Cancelled',
        cancellationReason: req.body.reason,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      }
    );
  }

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'APPOINTMENT',
    resourceId: recurringAppointment._id,
    description: `Cancelled recurring appointment ID: ${recurringAppointment._id}, reason: ${req.body.reason}`,
    req
  });

  res.status(200).json({
    success: true,
    data: recurringAppointment,
    cancelledAppointments: futureAppointments.length
  });
});

// @desc      Add exception to recurring appointment
// @route     POST /api/v1/recurring-appointments/:id/exceptions
// @access    Private
exports.addException = asyncHandler(async (req, res, next) => {
  let recurringAppointment = await RecurringAppointment.findById(req.params.id);

  if (!recurringAppointment) {
    return next(
      new ErrorResponse(`Recurring appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate request
  if (!req.body.date) {
    return next(
      new ErrorResponse('Please provide exception date', 400)
    );
  }

  // Add exception to recurring appointment
  const exception = {
    date: new Date(req.body.date),
    reason: req.body.reason || 'Exception',
    isRescheduled: req.body.isRescheduled || false,
    rescheduledTo: req.body.rescheduledTo ? new Date(req.body.rescheduledTo) : null
  };

  recurringAppointment = await RecurringAppointment.findByIdAndUpdate(
    req.params.id,
    { 
      $push: { exceptions: exception },
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Find and cancel the appointment for this date
  const exceptionDate = new Date(req.body.date);
  const startOfDay = new Date(exceptionDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(exceptionDate.setHours(23, 59, 59, 999));

  const appointmentToCancel = await Appointment.findOne({
    recurringAppointment: recurringAppointment._id,
    startTime: { $gte: startOfDay, $lte: endOfDay }
  });

  if (appointmentToCancel) {
    await Appointment.findByIdAndUpdate(
      appointmentToCancel._id,
      {
        status: 'Cancelled',
        cancellationReason: req.body.reason || 'Exception from recurring series',
        updatedBy: req.user.id,
        updatedAt: Date.now()
      }
    );
  }

  // Create rescheduled appointment if needed
  if (exception.isRescheduled && exception.rescheduledTo) {
    const originalAppointment = appointmentToCancel || {
      client: recurringAppointment.client,
      provider: recurringAppointment.provider,
      appointmentType: recurringAppointment.appointmentType,
      duration: recurringAppointment.duration,
      location: recurringAppointment.location,
      virtualMeetingLink: recurringAppointment.virtualMeetingLink,
      virtualMeetingPassword: recurringAppointment.virtualMeetingPassword,
      recurringAppointment: recurringAppointment._id
    };

    const rescheduledTime = new Date(exception.rescheduledTo);
    const endTime = new Date(rescheduledTime.getTime() + originalAppointment.duration * 60000);

    await Appointment.create({
      client: originalAppointment.client,
      provider: originalAppointment.provider,
      startTime: rescheduledTime,
      endTime: endTime,
      duration: originalAppointment.duration,
      appointmentType: originalAppointment.appointmentType,
      location: originalAppointment.location,
      virtualMeetingLink: originalAppointment.virtualMeetingLink,
      virtualMeetingPassword: originalAppointment.virtualMeetingPassword,
      status: 'Scheduled',
      notes: `Rescheduled from ${new Date(exception.date).toLocaleDateString()}`,
      recurringAppointment: recurringAppointment._id,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
  }

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'APPOINTMENT',
    resourceId: recurringAppointment._id,
    description: `Added exception to recurring appointment ID: ${recurringAppointment._id} for date: ${new Date(req.body.date).toISOString().split('T')[0]}`,
    req
  });

  res.status(200).json({
    success: true,
    data: recurringAppointment
  });
});

// Helper function to generate appointments based on recurrence pattern
const generateAppointments = async (recurringAppointment, userId) => {
  const generatedAppointments = [];
  const { 
    client, provider, appointmentType, duration, location,
    virtualMeetingLink, virtualMeetingPassword, recurrencePattern,
    dayOfWeek, dayOfMonth, weekOfMonth, useWeekOfMonth,
    startTime, startDate, endDate, numberOfOccurrences
  } = recurringAppointment;

  // Parse start time
  const [hours, minutes] = startTime.split(':').map(Number);
  
  // Set end date based on number of occurrences if not provided
  let calculatedEndDate = endDate;
  if (!calculatedEndDate && numberOfOccurrences) {
    calculatedEndDate = new Date(startDate);
    
    if (recurrencePattern === 'Weekly') {
      calculatedEndDate.setDate(calculatedEndDate.getDate() + (numberOfOccurrences - 1) * 7);
    } else if (recurrencePattern === 'Biweekly') {
      calculatedEndDate.setDate(calculatedEndDate.getDate() + (numberOfOccurrences - 1) * 14);
    } else if (recurrencePattern === 'Monthly') {
      calculatedEndDate.setMonth(calculatedEndDate.getMonth() + (numberOfOccurrences - 1));
    }
  }

  // Generate dates based on recurrence pattern
  const dates = [];
  let currentDate = new Date(startDate);
  
  // Set time
  currentDate.setHours(hours, minutes, 0, 0);
  
  // Map day of week string to number (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeekMap = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };
  
  // Adjust first date to match day of week if needed
  if (recurrencePattern === 'Weekly' || recurrencePattern === 'Biweekly') {
    const targetDayOfWeek = dayOfWeekMap[dayOfWeek];
    const currentDayOfWeek = currentDate.getDay();
    
    if (currentDayOfWeek !== targetDayOfWeek) {
      const daysToAdd = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
      currentDate.setDate(currentDate.getDate() + daysToAdd);
    }
  }
  
  // Generate dates
  while ((!calculatedEndDate || currentDate <= calculatedEndDate) && 
         (dates.length < (numberOfOccurrences || 52))) { // Limit to 52 occurrences if no end specified
    
    dates.push(new Date(currentDate));
    
    if (recurrencePattern === 'Weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (recurrencePattern === 'Biweekly') {
      currentDate.setDate(currentDate.getDate() + 14);
    } else if (recurrencePattern === 'Monthly') {
      if (useWeekOfMonth) {
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        
        // Get the same weekday in the desired week of month
        const targetDayOfWeek = dayOfWeekMap[dayOfWeek];
        currentDate.setDate(1); // Start from beginning of month
        
        // Find the first occurrence of the target day in the month
        while (currentDate.getDay() !== targetDayOfWeek) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Add weeks to get to the desired week of month
        currentDate.setDate(currentDate.getDate() + (weekOfMonth - 1) * 7);
      } else {
        // Simple day of month
        currentDate.setMonth(currentDate.getMonth() + 1);
        
        // Handle cases where the day might not exist in the month
        const targetDay = dayOfMonth;
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        currentDate.setDate(Math.min(targetDay, lastDayOfMonth));
      }
    }
  }
  
  // Create appointments for each date
  for (const date of dates) {
    const endTime = new Date(date.getTime() + duration * 60000);
    
    const appointment = await Appointment.create({
      client,
      provider,
      startTime: date,
      endTime,
      duration,
      appointmentType,
      location,
      virtualMeetingLink,
      virtualMeetingPassword,
      status: 'Scheduled',
      recurringAppointment: recurringAppointment._id,
      createdBy: userId,
      updatedBy: userId
    });
    
    generatedAppointments.push(appointment);
  }
  
  return generatedAppointments;
};

module.exports = {
  getRecurringAppointments,
  getClientRecurringAppointments,
  getProviderRecurringAppointments,
  getRecurringAppointment,
  createRecurringAppointment,
  updateRecurringAppointment,
  cancelRecurringAppointment,
  addException
};
