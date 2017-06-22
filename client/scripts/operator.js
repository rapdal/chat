chatApp.controller('OperatorController', function($rootScope, $scope, socket, APIService) {  
  $rootScope.isOperator = true; 
  $rootScope.session_id = 'operator1';

	$scope.operators = []
	$scope.operator = {
    id: 1,
    name: "",
    type: 'operator',
    active: false
  };   
	$scope.rooms = [];	

  socket.on('connect', function() {
    getOperators();
    getRooms();
  });

  socket.on('operators', function(operators) {
  	$scope.operators = operators;
  })

  socket.on('rooms', function(rooms) {
  	$scope.rooms = rooms;
  })    
  
  $scope.enableChat = function() {
  	$scope.operator.session_id = $rootScope.session_id;
  	APIService.addOperator($scope.operator).then(function(response) {
      $scope.operator = response.data;      
      $scope.operator.active = true;      
    });
  }

  $scope.acceptRequest = function(room_id) {  	
    var chat_url = '/chat/client/open.html#?interface=operator&room_id=' + room_id;
    window.open(chat_url, '_blank', 'width=400,height=500');

    var payload = {'room_id':room_id, 'operator':$scope.operator};
    APIService.acceptClient(payload).then(function(response) {
      $scope.rooms = response.data; // modify to index not retrieve
    });       
  }  

  getOperators = function() {
    APIService.getOperators().then(function(response) {
      $scope.operators = response.data;   
      operator_index = get_array_index('session_id', $rootScope.session_id, $scope.operators); 
      if (operator_index !== undefined) {            
        $scope.operator = $scope.operators[operator_index];
        $scope.operator.active = true; 
      }
    });
  }

  getRooms = function() {
    APIService.getRooms().then(function(response) {
      $scope.rooms = response.data;         
    });
  }

  get_array_index = function(key, value, haystack) {
    var index;
    haystack.some(function(entry, i) {
      if (entry[key] == value) {
          index = i;
          return true;
      }
    });
    return index;
  }
});