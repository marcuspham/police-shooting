/*
 * Marcus Pham
 * 
 * July 6, 2015
 * Creates an interactive map displaying police-shooting data
 */

"use strict";

// Module pattern to encapsulate variables
(function() {

	var MIN_MARKER_RADIUS = 3;
	var RADIUS_RANGE = 7;

	// Draws the map on window load
	window.onload = function() {
		drawMap();
	};

	// Creates the map centered on Washington State
	function drawMap() {
		var map = L.map('container').setView([47.505, -121.09], 7);

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', 
			{attribution: '&copy; <a href="http://osm.org/copyright">' 
			+ 'OpenStreetMap</a> contributors'}).addTo(map);

		getData(map);
	}

	// Takes a Leaflet map Object.
	// Sends an AJAX request to fetch police shooting data then build
	// the map on success
	function getData(map) {
		var data;
		$.ajax({
			url: 'data/response.json',
			type: 'get',
			success: function(dat) {
				data = dat;
				customBuild(dat, map);
			},
			dataType: 'json'
		});
	}

	// Takes in JSON data and a Leaflet map Object.
	// Puts markers on the map for every shooting incident.
	// Adds popups for each marker summarizing the event.
	function customBuild(data, map) {
		var victimArmed = [];

		data.map(function(d) {
			var color = (d['Hit or Killed?'] == "Killed") ? 'red' : 'orange';
			var date = d['Date Searched'];
			var radius = sizeFromDate(date);

			var marker = new L.circleMarker([d.lat, d.lng], {
				color: color,
				radius: radius
			});
			marker.addTo(map);

			var text = "<strong>" + parseDate(date)
						 + "</strong><br/>" + d['Summary'] + "<br/>"
						 + "<a target='_blank' href='"
						 + d['Source Link'] + "'>View Article</a>";
			marker.bindPopup(text);

			if (d['Armed or Unarmed?'] == "Armed") {
				victimArmed.push(marker);
			}

		});

		// Add layer to include incidents where the victim was armed
		var armedLayer = L.layerGroup(victimArmed);
		armedLayer.addTo(map);

		var overlayMaps = {
			"Victim Armed": armedLayer
		};

		L.control.layers(null, overlayMaps).addTo(map);
	}

	// Takes a date represented as "mm/dd/year" and returns
	// a marker size based on its proximity to the current year.
	function sizeFromDate(date) {
		if (!date) {
			return date;
		}

		var currYear = new Date().getFullYear();
		var shootingYear = date.split("/")[2];
		var yearDiff = currYear - shootingYear;
		var addSize = RADIUS_RANGE - Math.min(RADIUS_RANGE, yearDiff)

		return MIN_MARKER_RADIUS + addSize;
	}

	// Takes a date represented as "mm/dd/year" and returns the
	// full String representation of the date
	function parseDate(date) {
		if (!date) {
			return date;
		}

		var tokens = date.split("/");
		var day = tokens[1];
		var year = tokens[2];
		var months = ['January', 'February', 'March', 'April', 'May', 
					'June', 'July', 'August', 'September', 'October', 
					'November', 'December'];
		var month = months[tokens[0] - 1];

		return month + " " + day + ", " + year;
	}

}) ();
