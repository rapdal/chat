chatApp.factory('APIService', function($rootScope, $http, $log, $q){  
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

	  requestChat: function(client) {
	  	return $http({
		      method: 'POST',
		      url: $rootScope.server_ip + '/client',
		      data: client
		    })
	  		.then(function (response) { 
	  			return {
	  				data: response.data
	  			}		      
		    }, function (httpError) { throw httpError.status + " : " + httpError.data; });
		}
	}	
});