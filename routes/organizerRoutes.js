const express = require('express');
const router = express.Router();
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');
const org = require('../controllers/organizerController');

// All routes require Authentication + Organizer Role
router.use(authMiddleware, hasRole('Organizer'));

// 1. Event Flows
router.get('/events', org.getEvents);
router.post('/events', org.createEvent);
router.put('/events/:id', org.updateEvent);
router.post('/events/:id/cancel', org.cancelEvent);

// 2. Registration Management
router.get('/events/:id/attendees', org.getEventAttendees);
router.get('/sessions/:id/attendees', org.getSessionAttendees);

// 3. Analytics
router.get('/analytics', org.getAnalytics);

// 4. Session & Resource flows
router.post('/sessions', org.createSession);
router.get('/resources', org.getResources);
router.get('/events/:id/sessions', org.getSessionsForEvent);

router.get('/sessions/:id/allocations', org.getSessionAllocations);
router.post('/sessions/:id/allocations', org.allocateResource);
router.put('/sessions/:id/allocations/:res_id/release', org.releaseResource);

// 5. Vendor, Venue & Settings Management
router.get('/vendors', org.getVendors);
router.get('/venues', org.getVenues);
router.get('/venues-dynamic', org.getDynamicVenues);
router.get('/speakers', org.getSpeakers);
router.get('/events/:id/vendors', org.getEventVendors);
router.post('/vendors/link', org.linkVendor);

module.exports = router;
