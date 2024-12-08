const router = require('express').Router()
const middlewareController = require('../controllers/middlewareController');
const userController = require('../controllers/userController');

router.get('/getAllUser', middlewareController.verifyToken, userController.getAllUser)

router.delete('/:id',middlewareController.verifyTokenAndAdminAuth, userController.deleteUser )
router.put('/updateUser', userController.updateUser)


module.exports = router