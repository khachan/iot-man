module.exports = function(app) {
  	var deviceController = require('../controllers/deviceController');

	app.route("/api/device")
	    .get(deviceController.getDevices)
	    .post(deviceController.addDevice)
	    .put(deviceController.updateByName)
	    .delete(deviceController.deleteByName);

	app.route("/api/device/:deviceId")
	    .get(deviceController.getDevice)
	    .put(deviceController.updateById)
	    .delete(deviceController.deleteById);
};