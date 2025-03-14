const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

router.post('/users', UserController.createUser);
router.get('/users/:userId', UserController.getUserById);
router.put('/users/:userId', UserController.updateUser);
//router.put('/users/:userId/presence', UserController.updatePresence);
router.delete('/users/:userId', UserController.deleteUser);
router.get('/users/search', UserController.searchUsers);

module.exports = router;
