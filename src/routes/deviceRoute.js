const router = require('express').Router();
const deviceController = require('../controllers/deviceController')
const macController = require('../controllers/macController')
const espQueueController = require('../controllers/espQueueController')

router.post('/addRasp', deviceController.addRasp)
router.post('/addEsp', macController.addEsp)
router.get('/getAllESP/:macRasp', macController.getAllESP)
router.get('/getAll', macController.getAll)
router.post('/getAllRasp', deviceController.getAllRasp)
router.get('/getAllQueue', espQueueController.getAll)

router.get('/deleteRasp/:macRasp', deviceController.deleteRasp)
router.get('/deleteESP/:macAddr', macController.deleteESP)
router.get('/deleteESPQueue/:macAddr', espQueueController.deleteESPQueue)




module.exports = router
