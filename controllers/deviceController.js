var mongoose = require('mongoose');
var Device = mongoose.model('Device');

//Get all devices
exports.getDevices = function(req, res){
  var sortByName = {name: 1};
    Device.find({}, function(err, devices) {
      if (err){
        res.send(err);
      }
      res.json(devices);
    }).sort(sortByName);
};

//Get device by Id
exports.getDevice = function(req, res){
    Device.findById({_id : req.params.deviceId}, function(err, device) {
      if (err){
        res.send(err);
      }
      res.json(device);
    });
};

//Create new device
exports.addDevice = function(req, res){
  var newDevice = new Device(req.body);
  Object.assign(newDevice, {createTime: Date.now()});
  newDevice.save(function(err, device) {
    if (err){
      res.send(err);
    }
    res.json(device);
  });
};


//Update by id
exports.updateById = function(req, res){
  var updateDevice = req.body;
  Device.findOneAndUpdate({
      _id: req.params.deviceId
    }, updateDevice, {new: true}, function(err, device) {
      if (err){
        res.send(err);
      }
      res.json(device);
   });
};

//Update by name
exports.updateByName = function(req, res){
  var updateDevice = req.body;
  Device.findOneAndUpdate({name: req.body.name}, updateDevice, {new: true}, function(err, device) {
      if (err){
        res.send(err);
      }
      res.json(device);
   });
};

//Delete device by name
exports.deleteByName = function(req, res){
    Device.remove({
      name: req.body.name
    }, function(err, device) {
      if (err)
        res.send(err);
      res.json({ message: 'Device successfully deleted' });
    });
};

//Delete device by Id
exports.deleteById = function(req, res){
    Device.findOneAndDelete({
      _id: req.params.deviceId
    }, function(err, device) {
      if (err)
        res.send(err);
      res.json({ message: 'Device successfully deleted' });
    });
};


// UserModel.find()                   // find all users
//          .skip(100)                // skip the first 100 items
//          .limit(10)                // limit to 10 items
//          .sort({firstName: 1}      // sort ascending by firstName
//          .select({firstName: true} // select firstName only
//          .exec()                   // execute the query
//          .then(docs => {
//             console.log(docs)
//           })
//          .catch(err => {
//             console.error(err)
//           })