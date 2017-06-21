chatApp.controller('ChatController', function($rootScope, $scope, socket, APIService) {    
  $scope.isChatOpen = false;

  $scope.client = {}
  $scope.client.id = 1;
  $scope.client.name = 'Rad';

  $scope.operators = [];  
  $scope.operator = {};

  $scope.messages = []; 
  $scope.message = {}; 
  $scope.message.value = "";
  
  socket.on('connect', function() {});
 
  socket.on('operators', function(operators) {
    $scope.operators = operators;
  })  

  socket.on('chat', function(data) {    
    $scope.operator.name = data.name;
    $scope.messages.push(data)
  });  

  APIService.getOperators().then(function(response) {
    $scope.operators = response.data;
  });

  $scope.requestChat = function() {    
    APIService.requestChat($scope.client).then(function(response) {                
      socket.emit('join', response.data.room_id);
      $scope.client.room_id = response.data.room_id;      
      $scope.isChatOpen = true; 
    });    
  }

  $scope.sendMessage = function(){     
    var payload = {
      'room_id': $scope.client.room_id,
      'sender': 'client',
      'name': $scope.client.name,
      'message': $scope.message.value
    };
    socket.emit('send_message', payload);
    $scope.message.value = "";
  }  
});