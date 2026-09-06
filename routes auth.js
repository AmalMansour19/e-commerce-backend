const { login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/protect');

router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.post('/auth/logout', protect, logout);