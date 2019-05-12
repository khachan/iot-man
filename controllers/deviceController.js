var mongoose = require('mongoose');
var Device = mongoose.model('Device');
var DeviceHistory = mongoose.model('DeviceHistory');

//Get all devices
exports.getDevices = function(req, res){
  var sortByName = {name: 1};
    var param = req.params.name ? req.params : {} ;
    req.body["isDeleted"] = false;
    Device.find(req.body, function(err, devices) {
      if (err){
        res.send(err);
      }
      res.json(devices);
    }).sort(sortByName);
};

//Get device by Id
exports.getDevice = function(req, res){
    Device.findById({_id : req.params.deviceId, isDeleted : false}, function(err, device) {
      if (err){
        res.send(err);
      }
      res.json(device);
    });
};

//Create new device
exports.addDevice = function(req, res){
  var newDevice = new Device(req.body);
  newDevice["createTime"] = Date.now();
  newDevice["isDeleted"] = false;
  console.log("New Device: " + newDevice);
  newDevice.save(function(err, device) {
    if (err){
      res.send(err);
    }
    updateHistory(device);
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
      updateHistory(device);
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
      updateHistory(device);
      res.json(device);
   });
};

//Delete device by name
exports.deleteByName = function(req, res){
    Device.findOneAndUpdate({
      name: req.body.name
    }
    , {isDeleted: true}
    , function(err, device) {
      if (err){
        res.send(err);
      }
      updateHistory(device);
      res.json({ message: 'Device successfully deleted ' +  device});
    });
};

//Delete device by Id
exports.deleteById = function(req, res){
    Device.findOneAndUpdate({
      _id: req.params.deviceId, isDeleted: true
    }
    , {isDeleted: true}
    , {new: true}
    , function(err, device) {
      if (err){
        res.send(err);
      }
      updateHistory(device);
      res.json({ message: 'Device successfully deleted ' + device });
    });
};

var updateHistory =  function(device){
  if(device == undefined || device == null){
      console.log("Device is empty");
      return;
  }

  var deviceHistory = new DeviceHistory();
  deviceHistory.deviceId = device._id;
  deviceHistory.value = device.value;
  deviceHistory.updateTime = device.updateTime;
  deviceHistory.save(function(err, history) {
      if (err){
        console.log("History device error: " + err);
      }else{
        console.log("New history device: " + history);
      }
  });
}

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