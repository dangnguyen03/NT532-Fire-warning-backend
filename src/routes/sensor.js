const router = require('express').Router()
// const middlewareController = require('../controllers/middlewareController');
const dataController = require('../controllers/dataController');

router.get('/getAverage/:macAddr', dataController.getDataSensors)
router.get('/getAverageDay/:macAddr', dataController.getDataDay)
router.get('/getAverageMonth/:macAddr', dataController.getDataMonth)



module.exports = router