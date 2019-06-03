angular.module('myApp', [
    'ngRoute',
    'mobile-angular-ui',
	'btford.socket-io'
]).config(function($routeProvider) {

}).factory('mySocket', function (socketFactory) {
	var myIoSocket = io.connect('/webapp');	//Tên namespace webapp

	mySocket = socketFactory({
		ioSocket: myIoSocket
	});
	return mySocket;
	
/////////////////////// Những dòng code ở trên phần này là phần cài đặt, các bạn hãy đọc thêm về angularjs để hiểu, cái này không nhảy cóc được nha!
}).controller('Home', function($scope, $parse, mySocket, $http) {
	////Khu 1 -- Khu cài đặt tham số 
    //cài đặt một số tham số test chơi
	//dùng để đặt các giá trị mặc định
	$scope.url = "https://iot-man.herokuapp.com/api/device"
	// $scope.url = "http://172.20.10.5:3484/api/device"
    $scope.CamBienMua = 10;
    $scope.leds_status = [1, 1]
    $scope.speeds = [0, 0]
	$scope.lcd = ["", ""]
	$scope.servoPosition = 0
	$scope.buttons = [] //chả có gì cả, arduino gửi nhiêu thì nhận nhiêu!
	$scope.mapSensors = {'a' : "CamBienMua"
							,'b' : "leds_status"
						}
	$scope.devices = {"denBep": 0, "denPhongKhach" : 1, "denPhongAn": 2};

	// $scope.init();
	//Convert characters to number
	$scope.charsToInt = function(chars){
        if(chars == undefined){
        	return 0;
        }
        
        var result = 0;
        var i = 0;
        while(i < chars.length){
        	result = result*96 + (chars.charCodeAt(i) - 32);
            i++;
        }
        return result;
    }

	// in controller
	$scope.init = function () {
	    // check if there is query in url
	    // and fire search in case its value is not empty
	    $scope.updateSensor();
	    $scope.updateLED();
	};
	////Khu 2 -- Cài đặt các sự kiện khi tương tác với người dùng
	//các sự kiện ng-click, nhấn nút
	$scope.updateSensor  = function() {
		var led1 = {"name" : "Led 1", "value" : $scope.leds_status[0]};
		$scope.updateDevice(led1);
		var led2 = {"name" : "Led 2", "value" : $scope.leds_status[1]};
		$scope.updateDevice(led2);
		mySocket.emit("RAIN")
	}

	$scope.updateDevice = function(data){
		$http.put($scope.url, data)
	        .then(function(response){
               	console.log(response.data);
            }, function(response){
                console.log("Unable to perform get request");
        });
	};
	
	$scope.setValue = function(strVar, value) {
		var model = $parse(strVar)
		model.assign($scope, value)
	}
	
	//Cách gửi tham số 1: dùng biến toàn cục! $scope.<tên biến> là biến toàn cục
	$scope.updateDevice = function(device, value) {
		var param = $scope.numberToPrintableChar($scope.deviceToIndex(device));
		var json = {};
		json[eval('param')] = $scope.numberToPrintableChar(value);
		mySocket.emit("CLIENT_SEND", json)
	}

		//Cách gửi tham số 1: dùng biến toàn cục! $scope.<tên biến> là biến toàn cục
	$scope.updateLED = function() {

		mySocket.emit("LED")
	}
	
	//cập nhập lcd như một ông trùm 
	$scope.updateLCD = function() {
		var json = {
			"line": $scope.lcd
		}
		console.log("LCD_PRINT ", $scope.lcd)
		mySocket.emit("LCD_PRINT", json)
	}
	
	//Cách gửi tham số 2: dùng biến cục bộ: servoPosition. Biến này đươc truyền từ file home.html, dữ liệu đươc truyền vào đó chính là biến toàn cục $scope.servoPosition. Cách 2 này sẽ giúp bạn tái sử dụng hàm này vào mục đích khác, thay vì chỉ sử dụng cho việc bắt sự kiện như cách 1, xem ở Khu 4 để biết thêm ứng dụng!
	$scope.changeFanSpeed = function() {
		var json = {
			"level": $scope.speeds[0],
			"message": "Speed: " + $scope.speeds[0]
		}
		
		console.log("SEND FAN SPEED", json) //debug chơi à
		mySocket.emit("FAN", json)
	}
	


	////Khu 3 -- Nhận dữ liệu từ Arduno gửi lên (thông qua ESP8266 rồi socket server truyền tải!)
	//các sự kiện từ Arduino gửi lên (thông qua esp8266, thông qua server)
	mySocket.on('RAIN', function(json) {
		angular.forEach(json, function(val, key){ 
			if($scope.mapSensors.hasOwnProperty(key)){
				var value = (key == 'a') ? $scope.charsToInt(val) : val;
				$scope.setValue($scope.mapSensors[key], value);
			}
		});
	})

	//Khi nhận được lệnh LED_STATUS
	mySocket.on('LED_STATUS', function(json) {
		//Nhận được thì in ra thôi hihi.
		console.log("recv LED", json);
		$scope.leds_status = json.b
		var led1 = {"name" : "Led 1", "value" : $scope.leds_status[0]};
		$scope.updateDevice(led1);
		var led2 = {"name" : "Led 2", "value" : $scope.leds_status[1]};
		$scope.updateDevice(led2);
		iot.switchSingle("switch-light-1", $scope.leds_status[0]);
		iot.switchSingle("switch-light-2", $scope.leds_status[1]);
	})	
	
	/*New function start*/
	//Chuyển từ device name sang server index
	$scope.deviceToIndex = function(device) {
		//0-13 digital port; 14-19 analog port
		var index = 0;
		var value = parseInt(device.substr(1));
		var type = device.substr(0, 1);
		var base = 1;
		if(type == 'a'){
			index = 14;
			base = 6;
		} else if('d'){
			base = 14;
		}
		index = index + Math.floor(value/base) * 20 + value%base;
		return index;
	}

	$scope.indexToDevice = function(index) {
		//0-13 digital port; 14-19 analog port
		var result = 0;
		var value = Math.floor(index/20);
		var mod = index%20;
		var type = mod > 14 ? 'a' : 'd';
		var base = 1;
		if(mod > 14 ){
			result = 'a' + (value*6 + mod%14);
		} else{
			result = 'd' + (value*14 + mod);
		}
		return result;
	}
	
	$scope.numberToPrintableChar = function(number) {
		var result = '';
		while(number > 95){
			result = String.fromCharCode(number%96 +  32) + result;
			number = Math.floor(number/96);
		}
		result = String.fromCharCode(number%96 +  32) + result;
		return result;
	}


	//Chuyển từ device name sang server index
	$scope.printableCharToNumber= function(chars) {
		var number = 0;
		for(var i = 0; i < chars.length; i++){
			number = number*96 + chars.charCodeAt(i) - 32;
		}
		return number;
	}

	/*New function end*/

	//// Khu 4 -- Những dòng code sẽ được thực thi khi kết nối với Arduino (thông qua socket server)
	mySocket.on('connect', function() {
		console.log("connected")
		mySocket.emit("RAIN") //Cập nhập trạng thái mưa
	})

});