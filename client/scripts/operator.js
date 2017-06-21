chatApp.controller('OperatorController', function($rootScope, $scope, socket, APIService) {  
	$scope.isChatOpen = false;

	$scope.operators = []
	$scope.operator = {}
	$scope.operator.name = "";
	$scope.operator.active = false;

	$scope.clients = [];
	$scope.client = {};

	$scope.messages = []; 
  $scope.message = {}; 
  $scope.message.value = "";

  socket.on('connect', function() {});

  socket.on('operators', function(operators) {
  	$scope.operators = operators;
  })

  socket.on('clients', function(clients) {
  	$scope.clients = clients;
  })

  socket.on('chat', function(data) {
    $scope.isChatOpen = true;
    $scope.messages.push(data)
  }); 

  APIService.getOperators().then(function(response) {
    $scope.operators = response.data;
  });
  
  $scope.enableChat = function() {
  	$scope.operator.session_id = $rootScope.session_id;
  	APIService.addOperator($scope.operator).then(function(response) {
      $scope.operator = response.data
      $scope.operator.active = true;
      socket.emit('join', $scope.operator.room_id);
    });
  }

  $scope.acceptRequest = function(client) {
  	var payload = {'room_id':client.room_id, 'operator_name':$scope.operator.name};

    APIService.acceptClient(payload).then(function(response) {
      $scope.clients = response.data;
    });

  	$scope.client = client;  	
  	socket.emit('join', client.room_id);
  	$scope.isChatOpen = true;
  }

  $scope.sendMessage = function(){     
    var payload = {
      'room_id': $scope.client.room_id,
      'sender': 'operator',
      'name': $scope.operator.name,
      'message':$scope.message.value
    };
    socket.emit('send_message', payload);
    $scope.message.value = "";
  }  
});