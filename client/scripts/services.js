chatApp.factory('APIService', function($rootScope, $http){  		
	return {					
		getOperators: function() {
			return $http({
			  	method: 'GET',
			  	url: $rootScope.server_ip + '/operators'
			  })
				.then(function (response) {
			  	return {
			  		data: response.data
			  	}			  	
				}, function (httpError) { throw httpError.status + " : " + httpError.data; });
	  },
	  addOperator: function(operator) {
	  	return $http({
			  	method: 'POST',
			  	url: $rootScope.server_ip + '/operator',
			  	data: operator
			  })
			  .then(function (response) {
			  	return {
			      data: response.data		      
			    }
		    }, function (httpError) { throw httpError.status + " : " + httpError.data; });
	  },
	  acceptClient: function(payload) {
	  	return $http({
			  	method: 'POST',
			  	url: $rootScope.server_ip + '/accept',
			  	data: payload
			  })
	  		.then(function (response) {
		      return {
		      	data: response.data
		      }
		    }, function (httpError) { throw httpError.status + " : " + httpError.data; });
	  },
	  createRoom: function(client) {
	  	return $http({
		      method: 'POST',
		      url: $rootScope.server_ip + '/room',
		      data: client
		    })
	  		.then(function (response) { 
	  			return {
	  				data: response.data
	  			}		      
		    }, function (httpError) { throw httpError.status + " : " + httpError.data; });
		},
		getRooms: function(room_id) {
			return $http({
			  	method: 'GET',
			  	url: $rootScope.server_ip + '/rooms'
			  })
				.then(function (response) {
			  	return {
			  		data: response.data
			  	}			  	
				}, function (httpError) { throw httpError.status + " : " + httpError.data; });
		},
		getRoom: function(room_id = 0) {
			return $http({
			  	method: 'GET',
			  	url: $rootScope.server_ip + '/room/'+room_id
			  })
				.then(function (response) {
			  	return {
			  		data: response.data
			  	}			  	
				}, function (httpError) { throw httpError.status + " : " + httpError.data; });
		},
		deleteRoom: function(room_id) {
			return $http({
			  	method: 'DELETE',
			  	url: $rootScope.server_ip + '/room/'+room_id,
			  })
				.then(function (response) {
			  	return {
			  		data: response.data
			  	}			  	
				}, function (httpError) { throw httpError.status + " : " + httpError.data; });
		}
	}	
});

chatApp.service('ChatService', function(){
	var _sender = {}
	return {
		getSender: function() {			
			return _sender;
		},
		setSender: function(sender) {					
			_sender = sender;			
		},
	}
});