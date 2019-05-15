var express = require('express')
var router = express.Router()
var deviceController = require('../controllers/DeviceController');
var VerifyToken = require('../controllers/VerifyToken');

// middleware that is specific to this router
// router.use(function verifyToken(req, res, next) {
//   console.log("Headers: " + req.headers['access-token']);
//   var token = req.headers['access-token'];
//   if (!token)
//     return res.status(403).send({ auth: false, message: 'No token provided.' });
//   jwt.verify(token, config.secret, function(err, decoded) {
//     if (err)
//     return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//     // if everything good, save to request for use in other routes
//     req.userId = decoded.id;
//     next();
//   });
// });

router.use(function (req, res, next) {
	console.log(req.params);
  if (!req.headers['x-auth']) return next()
  next()
})

router.route("/")
    .get(VerifyToken, deviceController.getDevices)
    .post(deviceController.addDevice)
    .put(deviceController.updateByName)
    .delete(deviceController.deleteByName);

router.route("/:deviceId")
    .get(deviceController.getDevice)
    .put(deviceController.updateById)
    .delete(deviceController.deleteById);

module.exports = router