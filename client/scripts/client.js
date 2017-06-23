chatApp.controller('ClientController', function($rootScope, $scope, socket, APIService) {  
  $rootScope.isClient = true;  
  $rootScope.session_id = 'client1';

  $scope.client = {
    id: 1,
    type: 'client',
    name: 'Rad'      
  }
  $scope.operators = [];  
  $scope.operator = {};
  
  socket.on('connect', function() {});

  socket.on('chat', function(data) {
    console.log(data)
  });

  socket.on('operators', function(operators) {
    setOperators(operators)
  })   

  APIService.getOperators().then(function(response) {
    setOperators(response.data)
  });

  $scope.requestChat = function() {   
    APIService.getRoom($scope.client.room_id).then(function(response){      
      if(response.data.id) {
        alert("You already have a pending request.")
      }
      else {
        APIService.createRoom($scope.client).then(function(response) {                           
          $scope.client.room_id = response.data.room_id; 
          var chat_url = '/chat/client/open.html#?interface=client&room_id=' + $scope.client.room_id;      
          window.open(chat_url, '_blank', 'width=400,height=500');
        });   
      }
    });
       
  }

  setOperators = function(operators) {
    $scope.operators = operators;
    if (operators.length) {
      $scope.canRequest = true;
    }
  }
});