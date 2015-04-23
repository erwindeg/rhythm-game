'use strict';

/**
 * @ngdoc function
 * @name resourcesApp.controller:MainCtrl
 * @description # MainCtrl Controller of the resourcesApp
 */
angular.module('resourcesApp').controller(
		'MainCtrl',
		function($scope, $resource) {
			var counterThres = 1;
			var deltaTime = 200;
			var lastTime = 0;
			var counter = 0;
			var alpha = 0.8;
			var gravity = [ 0, 0, 0 ];
			$scope.shake = [];
			$scope.move = '';
			var eb = new vertx.EventBus('http://' + window.location.host
					+ '/eventbus');
			eb.onopen = function() {
				if (window.DeviceMotionEvent) {
					console.log("DeviceMotionEvent is supported");
					window.addEventListener('devicemotion',
							function(event) {
								var a = event.accelerationIncludingGravity;
								// console.log(event.timeStamp);
								gravity[0] = (alpha * gravity[0])
										+ ((1 - alpha) * a.x);
								gravity[1] = (alpha * gravity[1])
										+ ((1 - alpha) * a.y);
								gravity[2] = (alpha * gravity[2])
										+ ((1 - alpha) * a.z);

								var accX = Math.abs(a.x - gravity[0]);
								var accY = Math.abs(a.y - gravity[1]);
								var accZ = Math.abs(a.z - gravity[2]);
								$scope.move = Math.round(accX) + ', '
										+ Math.round(accY) + ', '
										+ Math.round(accZ);

								if (accX > 5 || accY > 5 || accZ > 5) {
									if ((event.timeStamp - lastTime) < deltaTime) {
										counter++;
										if (counter > counterThres) {
											$scope.shake.push(event.timeStamp
													+ ': SHAKE!!!!');
											$scope.$digest();
											eb.send('shake', event.timeStamp);
											counter = 0;											
										}
									} else {
										counter =0;
									}
									lastTime = event.timeStamp;
								}
							});
				}

			}

		});
