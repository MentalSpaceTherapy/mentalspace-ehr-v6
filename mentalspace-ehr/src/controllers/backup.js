const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const auditLogger = require('../utils/auditLogger');

// @desc      Create database backup
// @route     POST /api/v1/backup/database
// @access    Private (Admin only)
exports.createDatabaseBackup = asyncHandler(async (req, res, next) => {
  // In a real implementation, this would use mongodump or a similar tool
  // For this demo, we'll simulate creating a backup file
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFileName = `mentalspace_backup_${timestamp}.gz`;
  const backupPath = path.join(process.cwd(), 'backups', backupFileName);
  
  // Ensure backups directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
    fs.mkdirSync(path.join(process.cwd(), 'backups'), { recursive: true });
  }
  
  try {
    // Simulate backup process
    // In a real implementation, this would be something like:
    // await execPromise(`mongodump --uri=${process.env.MONGO_URI} --gzip --archive=${backupPath}`);
    
    // For demo, just create an empty file
    fs.writeFileSync(backupPath, 'Simulated database backup content');
    
    // Log the action
    await auditLogger.log({
      user: req.user.id,
      action: 'BACKUP',
      resourceType: 'DATABASE',
      description: `Created database backup: ${backupFileName}`,
      req
    });
    
    res.status(200).json({
      success: true,
      data: {
        fileName: backupFileName,
        path: backupPath,
        timestamp: new Date(),
        size: fs.statSync(backupPath).size
      }
    });
  } catch (err) {
    return next(
      new ErrorResponse(`Error creating database backup: ${err.message}`, 500)
    );
  }
});

// @desc      Get all database backups
// @route     GET /api/v1/backup/database
// @access    Private (Admin only)
exports.getDatabaseBackups = asyncHandler(async (req, res, next) => {
  const backupDir = path.join(process.cwd(), 'backups');
  
  // Ensure backups directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    const files = fs.readdirSync(backupDir);
    
    // Get details for each backup file
    const backups = files
      .filter(file => file.startsWith('mentalspace_backup_') && file.endsWith('.gz'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          fileName: file,
          path: filePath,
          timestamp: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending
    
    // Log the access
    await auditLogger.log({
      user: req.user.id,
      action: 'READ',
      resourceType: 'DATABASE_BACKUPS',
      description: `Accessed database backup list`,
      req
    });
    
    res.status(200).json({
      success: true,
      count: backups.length,
      data: backups
    });
  } catch (err) {
    return next(
      new ErrorResponse(`Error retrieving database backups: ${err.message}`, 500)
    );
  }
});

// @desc      Download database backup
// @route     GET /api/v1/backup/database/:fileName
// @access    Private (Admin only)
exports.downloadDatabaseBackup = asyncHandler(async (req, res, next) => {
  const { fileName } = req.params;
  const filePath = path.join(process.cwd(), 'backups', fileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return next(
      new ErrorResponse(`Backup file not found: ${fileName}`, 404)
    );
  }
  
  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DOWNLOAD',
    resourceType: 'DATABASE_BACKUP',
    description: `Downloaded database backup: ${fileName}`,
    req
  });
  
  res.download(filePath);
});

// @desc      Delete database backup
// @route     DELETE /api/v1/backup/database/:fileName
// @access    Private (Admin only)
exports.deleteDatabaseBackup = asyncHandler(async (req, res, next) => {
  const { fileName } = req.params;
  const filePath = path.join(process.cwd(), 'backups', fileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return next(
      new ErrorResponse(`Backup file not found: ${fileName}`, 404)
    );
  }
  
  try {
    // Delete the file
    fs.unlinkSync(filePath);
    
    // Log the action
    await auditLogger.log({
      user: req.user.id,
      action: 'DELETE',
      resourceType: 'DATABASE_BACKUP',
      description: `Deleted database backup: ${fileName}`,
      req
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    return next(
      new ErrorResponse(`Error deleting database backup: ${err.message}`, 500)
    );
  }
});

// @desc      Restore database from backup
// @route     POST /api/v1/backup/database/:fileName/restore
// @access    Private (Admin only)
exports.restoreDatabaseBackup = asyncHandler(async (req, res, next) => {
  const { fileName } = req.params;
  const filePath = path.join(process.cwd(), 'backups', fileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return next(
      new ErrorResponse(`Backup file not found: ${fileName}`, 404)
    );
  }
  
  try {
    // In a real implementation, this would use mongorestore or a similar tool
    // For this demo, we'll simulate the restore process
    
    // Simulate restore process
    // In a real implementation, this would be something like:
    // await execPromise(`mongorestore --uri=${process.env.MONGO_URI} --gzip --archive=${filePath}`);
    
    // Log the action
    await auditLogger.log({
      user: req.user.id,
      action: 'RESTORE',
      resourceType: 'DATABASE',
      description: `Restored database from backup: ${fileName}`,
      req
    });
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Database restored successfully',
        fileName,
        timestamp: new Date()
      }
    });
  } catch (err) {
    return next(
      new ErrorResponse(`Error restoring database: ${err.message}`, 500)
    );
  }
});

// @desc      Create system logs backup
// @route     POST /api/v1/backup/logs
// @access    Private (Admin only)
exports.createLogsBackup = asyncHandler(async (req, res, next) => {
  // In a real implementation, this would archive log files
  // For this demo, we'll simulate creating a logs backup file
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFileName = `mentalspace_logs_${timestamp}.zip`;
  const backupPath = path.join(process.cwd(), 'backups', backupFileName);
  
  // Ensure backups directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
    fs.mkdirSync(path.join(process.cwd(), 'backups'), { recursive: true });
  }
  
  try {
    // Simulate logs backup process
    // In a real implementation, this would zip log files
    
    // For demo, just create an empty file
    fs.writeFileSync(backupPath, 'Simulated logs backup content');
    
    // Log the action
    await auditLogger.log({
      user: req.user.id,
      action: 'BACKUP',
      resourceType: 'LOGS',
      description: `Created logs backup: ${backupFileName}`,
      req
    });
    
    res.status(200).json({
      success: true,
      data: {
        fileName: backupFileName,
        path: backupPath,
        timestamp: new Date(),
        size: fs.statSync(backupPath).size
      }
    });
  } catch (err) {
    return next(
      new ErrorResponse(`Error creating logs backup: ${err.message}`, 500)
    );
  }
});

// @desc      Get system health status
// @route     GET /api/v1/backup/health
// @access    Private (Admin only)
exports.getSystemHealth = asyncHandler(async (req, res, next) => {
  try {
    // In a real implementation, this would check various system metrics
    // For this demo, we'll return simulated health data
    
    const healthData = {
      database: {
        status: 'healthy',
        connectionPool: 5,
        responseTime: '45ms',
        uptime: '15 days'
      },
      server: {
        status: 'healthy',
        cpuUsage: '23%',
        memoryUsage: '42%',
        diskSpace: {
          total: '100GB',
          used: '35GB',
          free: '65GB'
        },
        uptime: '15 days'
      },
      services: {
        api: {
          status: 'healthy',
          responseTime: '120ms'
        },
        scheduler: {
          status: 'healthy',
          activeJobs: 3
        },
        emailService: {
          status: 'healthy',
          queueSize: 0
        }
      },
      lastChecked: new Date()
    };
    
    // Log the access
    await auditLogger.log({
      user: req.user.id,
      action: 'READ',
      resourceType: 'SYSTEM_HEALTH',
      description: 'Accessed system health status',
      req
    });
    
    res.status(200).json({
      success: true,
      data: healthData
    });
  } catch (err) {
    return next(
      new ErrorResponse(`Error retrieving system health: ${err.message}`, 500)
    );
  }
});
