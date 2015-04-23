'use strict';

/**
 * @ngdoc function
 * @name resourcesApp.controller:SongCtrl
 * @description # SongCtrl Controller of the resourcesApp
 */
angular.module('resourcesApp').controller(
		'SongCtrl',
		function($scope, $resource, $timeout) {
			var eb = new vertx.EventBus('http://' + window.location.host
					+ '/eventbus');
			$scope.danceMove = false;
			var ctx = new AudioContext();
			var audio = document.getElementById('myAudio');
			var audioSrc = ctx.createMediaElementSource(audio);
			var analyser = ctx.createAnalyser();
			analyser.fftSize = 64;
			// we have to connect the MediaElementSource with the analyser
			audioSrc.connect(analyser);
			analyser.connect(ctx.destination);
			// we could configure the analyser: e.g. analyser.fftSize (for
			// further infos read the spec)

			// frequencyBinCount tells you how many values you'll receive from
			// the analyser
			var frequencyData = new Uint8Array(analyser.frequencyBinCount);

			// we're ready to receive some data!
			// loop
			function renderFrame() {
				requestAnimationFrame(renderFrame);
				// update data in frequencyData
				analyser.getByteFrequencyData(frequencyData);
				// render frame based on values in frequencyData
				console.log(frequencyData);
				renderChart(frequencyData);
				if (frequencyData[11] + frequencyData[12] + frequencyData[13]
						+ frequencyData[14] > 200) {
					$scope.danceMove = true;
					eb.send('rhythm',Date.now());
					$scope.$apply();
					$timeout(function() {
						$scope.danceMove = false;
						$scope.$apply();
					}, 500);
				}
			}
			renderFrame();

			function renderChart(data) {
				var scale = d3.scale.linear().domain([ 0, 50 ]).range(
						[ 0, 100 ]);

				var bars = d3.select(".chart").selectAll("div").attr("id",
						"work_queues_chart").data(data);

				// enter selection
				bars.enter().append("div");

				// update selection
				bars.style("width", function(d) {
					return scale(d) + "px";
				}).text(function(d, i) {
					return i + ': ' + d;
				});

				// exit selection
				bars.exit().remove();
			}
		});
