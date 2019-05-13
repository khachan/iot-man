var mongoose = require('mongoose');
var Device = mongoose.model('Device');

module.exports = function(app, io) {

  app.get('/api', (req, res) => {
    var json = {
      "b": "{1,1}"
    }
    console.log("send LED ", json['b'])
    //io.emit("LED", json)
      return res.send(json);
  });

  app.post('/api', (req, res) => {
    return res.send('Received a POST HTTP method');
  });

  app.put('/api', (req, res) => {
   var param = req.body;
   var data = {"name": "Led " + (2  - param[0])};
   Device.find(data, function(err, devices) {
        if (err){
          res.send(err);
        }
        if(devices.length){
          if(param[0] == 0){
            controlLed([param[1], devices[0].value]);
          }else{
            controlLed([devices[0].value, param[1]]);
          }
          
        }
        res.json(devices);
    });
  });

  app.delete('/api', (req, res) => {
    console.log("DELETE: " +  req.query[0]);
    return res.send('Received a DELETE HTTP method');
  });

  var controlLed = function(data){
    console.log("Led state: " + data)
    io.emit("LED", {"b" : data});
  }


};