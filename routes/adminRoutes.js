const express = require('express');
const router = express.Router();
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');
const admin = require('../controllers/adminController');

// All routes require Authentication + Admin Role
router.use(authMiddleware, hasRole('Admin'));

// User & Role Management
router.get('/users', admin.getAllUsers);
router.put('/users/:id', admin.updateUser);
router.post('/users/:id/roles', admin.assignRole);
router.delete('/users/:id/roles', admin.removeRole);
router.put('/users/:id/deactivate', admin.deactivateUser);

router.post('/users', admin.createUser);
router.delete('/users/:id/permanent', admin.deleteUser);

// Event Management
router.get('/events', admin.getAllEvents);
router.post('/events/:id/cancel', admin.cancelEvent);
router.get('/events/:id/sessions', admin.getEventSessions);
router.get('/events/:id/registrations', admin.getEventRegistrations);
router.get('/events/:id/resources', admin.getEventResources);
router.get('/sessions/:id/registrations', admin.getSessionRegistrations);

// System Analytics
router.get('/analytics', admin.getPlatformAnalytics);
router.get('/payments', admin.getAllTransactions);
router.get('/resources', admin.systemResourceAudit);
router.get('/resources/:id/allocations', admin.getResourceAllocationsLog);

// Vendors
router.get('/vendors', admin.getVendors);
router.post('/vendors', admin.createVendor);
router.delete('/vendors/:id', admin.deleteVendor);

module.exports = router;
