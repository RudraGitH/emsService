var app = angular.module('myApp', []);
	app.controller('ValidController', function($scope, $http) {

		var employeeIdLength = 6;
		var json = [];
		var jsonLoggedIn = [];
		var jsonLoggedOut = [];
		var EmployeeName="";
		var loginSuccess=1;
		var logoutSuccess=2;
		var status=10;

		/* set initial values */
		function defaultValues() {
			$scope.empId = '';
			$scope.invalidMsg = "";
			$scope.showInvalidMsg = false;
			$scope.cssClass = "first";
			$scope.buttonDisable = true;
			$scope.buttonText = "In-Time";
		}

		/* set default values  */
		defaultValues();

		/* function calls to get Employee Ids  */
		getAllEmpIds();
		getLoggedInEmpIds();
		getLoggedOutEmpIds();
		

		/* function to get all employeeIds from jsp as array */
		function getAllEmpIds() {

			var response = $http.post('/EmployeeManagementSystem/getAllEmpIds.do');
			response.success(function(data, status, headers, config) {
				$scope.jsondata = data;
				json = data;

			});
			response.error(function(data, status, headers, config) {
				alert("failure message: " + JSON.stringify({
					data : data
				}));
			});

		}

		/* function to get loggedIn empIds from jsp as array */
		function getLoggedInEmpIds() {
			var loggedInusers = $http.post('/EmployeeManagementSystem/getLoggedInEmpIds.do');
			loggedInusers.success(function(data, status, headers, config) {
				jsonLoggedIn = data;
				$scope.loggedInIds = data;

			});
			loggedInusers.error(function(data, status, headers, config) {
				alert("failure message: " + JSON.stringify({
					data : data
				}));
			});

		}
		/*function to get logout employee Ids as jsonArray */
		function getLoggedOutEmpIds() {

			var loggedOut = $http.post('/EmployeeManagementSystem/getLoggedOutEmpIds.do');
			loggedOut.success(function(data, status, headers, config) {
				$scope.jsonLoggedOut = data;
				jsonLoggedOut = data;
				console.log("logged out ids: "+data);

			});
			loggedOut.error(function(data, status, headers, config) {
				alert("failure message: " + JSON.stringify({
					data : data
				}));
			});

		}

		$scope.validateData = function() {

			$scope.successMessage = "";
			if ($scope.empId.length == employeeIdLength) {
				if (searchInArray($scope.empId, jsonLoggedOut)) {
					$scope.invalidMsg = "You Are Visited Today";
					$scope.showInvalidMsg = true;
					$scope.cssClass = "error";
					$scope.buttonDisable = true;
					$scope.buttonText = "invalid";
				
				} else if (searchInArray($scope.empId, jsonLoggedIn)) {
					$scope.invalidMsg = "";
					$scope.showInvalidMsg = false;
					$scope.cssClass = "ok";
					$scope.buttonDisable = false;
					$scope.buttonText = "Out-Time";
					status=1;

				} else if ($scope.empId.length == employeeIdLength) {
					if (searchInJsonObjectArray($scope.empId, json)) {

						$scope.invalidMsg = "";
						$scope.showInvalidMsg = false;
						$scope.cssClass = "ok";
						$scope.buttonDisable = false;
						$scope.buttonText = "In-Time";
						status=0;

					} else {
						
						$scope.invalidMsg = "Invalid Employee Id";
						$scope.showInvalidMsg = true;
						$scope.cssClass = "error";
						$scope.buttonDisable = true;
						$scope.buttonText = "In-Time";

					}

				}

			} else {
				$scope.cssClass = "error";
				$scope.showInvalidMsg = false;
				$scope.buttonDisable = true;

			}

		};

		/* function for redirect*/
		$scope.redirect = function(empId) {
			
			if(status == 0){
				swal({
					title :EmployeeName ,
					text : "Are You continue to log-In",
					imageUrl: "images/welcome4.jpg",
					showCancelButton : true,
					confirmButtonColor : "#DD6B55",
					confirmButtonText : "Yes",
					cancelButtonText : "No",
					closeOnConfirm : false,
					closeOnCancel : false
				}, function(isConfirm){
					if (isConfirm) {
						var object={id:empId,type:"login"};
						var sendId = $http.post("/EmployeeManagementSystem/log.do",object);
						sendId.success(function(data, status, headers, config) {
					              var res = data;						             
					              console.log("returned value: "+res);
					              console.log("is numer if res: "+angular.isNumber(res));
					              if(res == loginSuccess){
					            	  jsonLoggedIn[jsonLoggedIn.length] = empId;
								      $scope.loggedInIds = jsonLoggedIn;
					            	  swal("OK", "Success fully Logged-in", "success");
					              }
					              else
					            	  swal("Problem occured!","Try Again","error");

					       });
					       sendId.error(function(data, status, headers, config) {
					       /*alert("failure message: " + JSON.stringify({
					         data : data
					        }));*/
					        swal("Problem Occured ","Try Again","error");
					       });
							
					}
					else 
						swal("You are rejected !", "try Again", "error");
					
				});
				
				console.log("in");
			}
			else{
				
				swal({
					title : EmployeeName ,
					text : "Are You Continue To Logout",
					imageUrl: "images/bye2.jpg",
					showCancelButton : true,
					confirmButtonColor : "#DD6B55",
					confirmButtonText : "Yes",
					cancelButtonText : "No",
					closeOnConfirm : false,
					closeOnCancel : false
				}, function(isConfirm) {
					if (isConfirm) {
						var object={id:empId,type:"logout"};
						var sendId = $http.post("/EmployeeManagementSystem/log.do",object);
						sendId.success(function(data, status, headers, config) {
					              var res = data;						             
					              console.log("returned value: "+res);
					              console.log("is numer if res: "+angular.isNumber(res));
					              if(res == logoutSuccess){
					            	 jsonLoggedOut[jsonLoggedOut.length] = empId;
					            	 	$scope.jsonLoggedOut = jsonLoggedOut;
					            	 		swal("OK", "Success fully Logged-out", "success");
					              }
					              else
					            	  swal("Problem occured!","Try Again","error");

					       });
					       sendId.error(function(data, status, headers, config) {
					       /*alert("failure message: " + JSON.stringify({
					         data : data
					        }));*/
					        swal("Problem occured!","Try Again","error");
					       });
						
						
					} else {
						swal("You are rejected !", "", "error");
					}
				});

				console.log("out");
				
			}
			
			defaultValues();
		};
		
		
		


		/* function for searching element in JsonObjectArray */
		function searchInJsonObjectArray(key, arr) {
			var length = arr.length;
			for (var i = 0; i < length; i++) {
				if (key == arr[i].empId){					
					EmployeeName=arr[i].empName;
					return true;
				}
			}
			return false;

		}
		
		/* function for searching element in JsonArray */
		function searchInArray(key, arr) {
			var length = arr.length;
			for (var i = 0; i < length; i++) {
				if (key == arr[i]){
					return true;
				}
			}
			return false;

		}

		/*  function to click the admin-login button */
		$scope.AdminButton = function() {

			window.location.href = "second.html";

		};

	});

	/* controller to display Date and Time */

	app.controller('timeController', [ '$scope', function($scope) {
		$scope.format = 'd/M/yy h:mm:ss a';
	} ]);

	app.directive("myCurrentTime", function(dateFilter) {
		return function(scope, element, attrs) {
			var format;

			scope.$watch(attrs.myCurrentTime, function(value) {
				format = value;
				updateTime();
			});

			function updateTime() {
				var dt = dateFilter(new Date(), format);
				element.text(dt);
			}

			function updateLater() {
				setTimeout(function() {
					updateTime(); // update DOM
					updateLater(); // schedule another update
				}, 1000);
			}

			updateLater();
		}
	});