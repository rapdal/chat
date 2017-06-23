chatApp.controller('ChatController', function($rootScope, $scope, socket, $location, APIService) {	
	$scope.messages = []; 
  $scope.message = {}; 
  $scope.message.value = "";

  $scope.sender = {};
  $scope.receiver = {};  
   	
  var searchObject = $location.search();
  room_id = searchObject.room_id;
  $scope.interface = searchObject.interface;  

  socket.on('connect', function() {
  	socket.emit('join', room_id);
  	var promise = getRoom(room_id);  	
  	promise.then(function(response) {	  	
	    if ($scope.interface == 'client') {
	    	$scope.sender = response.data.client
	    	$scope.receiver = response.data.operator
	    }
	    else if ($scope.interface == 'operator') {
	    	$scope.sender = response.data.operator
	    	$scope.receiver = response.data.client	    	
		  	var payload = {
		      'room_id': room_id,
		      'sender': 'system',
		      'name': 'System',
		      'message': 'Operator has connected.'
		    };		
		    socket.emit('send_message', payload);
	    }
	  });
  });

  socket.on('chat', function(data) {
  	if (data.sender=='system' && $scope.interface=='client') {
  		var promise = getRoom(room_id);
  		promise.then(function(response) {	  	
	    	$scope.sender = response.data.client;
	    	$scope.receiver = response.data.operator;
	  	});
	  }
    $scope.messages.push(data)
  });    

	$scope.sendMessage = function(){     
    var payload = {
      'room_id': room_id,
      'sender': $scope.sender.type,
      'name': $scope.sender.name,
      'message': $scope.message.value
    };
    socket.emit('send_message', payload);
    $scope.message.value = "";
  }  

  $scope.leaveChat = function() {
  	socket.emit('leave', room_id);
  	if ($scope.sender.type == 'client') {
  		message = 'Client has disconnected.'
  		APIService.deleteRoom(room_id).then(function(response) {
			});
		} 
		else if ($scope.sender.type == 'operator') {
			message = 'Operator has disconnected. Reopen issue by checking back on the Support page.'	  	
		}
		var payload = {
      'room_id': room_id,
      'sender': 'system',
      'name': 'System',
      'message': message
    };
		socket.emit('send_message', payload); 
		window.close();  
  }

  getRoom = function(room_id) {
  	return APIService.getRoom(room_id);
  }
});