const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ user_id: 2, role: 'Organizer' }, 'your_jwt_secret', { expiresIn: '1h' }); 
// Need to find out what secret is used. I'll read backend middleware.
