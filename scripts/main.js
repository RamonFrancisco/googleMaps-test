'use strict';

let map;
const 	$showListings = document.querySelector('#show-listings'),
		$hideListings = document.querySelector('#hide-listings'),
		$toggleDrawing = document.querySelector('#toggle-drawing'),
		$map = document.querySelector('#map'),
		$zoom = document.querySelector('#zoom-to-area'),
		$searchWithinTime = document.querySelector('#search-within-time');

const markers = [];
let polygon = null;

const style = [
	{ featureType: 'transit.station.bus', elementType: 'geometry', stylers: [{ color: '#000000' }]},
]

function initMap() {
	const defaultIcon = makeMarkerIcon('ff0000');
	const highlightedIcon = makeMarkerIcon('00fff0');

	const locations = [
		{ title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
		{ title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
		{ title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
		{ title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
		{ title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
		{ title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
	];
	const infoWindow = new google.maps.InfoWindow();
	const geocoder = new google.maps.Geocoder();
	
	const drawing = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYGON,
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_LEFT,
			drawingModes: [
				google.maps.drawing.OverlayType.POLYGON
			]
		}
	})

	map = new google.maps.Map($map , {
		center: { lat: 40.7413549, lng: -73.9980244 },
		// styles: style,
		mapTypeControl: true,
		zoom: 13
	});

	locations.forEach((location, idx) => {
		const position = location.location;
		const title = location.title;

		const marker = new google.maps.Marker({
			position: position,
			title: title,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			id: idx
		});

		markers.push(marker);
		marker.addListener('click', function() {
			populateInfoWindow(this, infoWindow);
		});

		marker.addListener('mouseover', function() {
			this.setIcon(highlightedIcon);
		});

		marker.addListener('mouseout', function () {
			this.setIcon(defaultIcon);
		})
	})

	$showListings.addEventListener('click', showListings);
	$hideListings.addEventListener('click', hideListings);
	$toggleDrawing.addEventListener('click', () => {
		toggleDrawing(drawing);
	});

	drawing.addListener('overlaycomplete', (event) => {
		if (polygon) {
			polygon.setMap(null);
			hideListings();
		}

		drawing.setDrawingMode(null);

		polygon = event.overlay;
		polygon.setEditable(true);
		searchWithinPolygon();
		polygon.getPath().addListener('set-at', searchWithinPolygon);
		polygon.getPath().addListener('insert-at', searchWithinPolygon);
		const area = google.maps.geometry.spherical.computeArea(polygon.getPath())
		window.alert(area);
	});

	drawing.addListener('computeArea');

	$zoom.addEventListener('click', () => {
		geocoderAddress(geocoder, map);
	})

	$searchWithinTime.addEventListener('click', () => {
		searchWithinTime();
	})
}

const populateInfoWindow = (marker, infoWin) => {
	if( infoWin.marker != marker ) {
		infoWin.marker = marker;
		infoWin.setContent('');		
		infoWin.addListener('closeClick', () => infoWin.setMarker(null));

		const streetViewServce = new google.maps.StreetViewService();
		const radius = 100;

		const getStreetView = (data, status) => {
			if( status == google.maps.StreetViewStatus.OK) {
				const nearStreetViewLocation = data.location.latLng;
				const heading = google.maps.geometry.spherical.computeHeading(
					nearStreetViewLocation, marker.position);
				infoWin.setContent(`<div>${marker.title}</div><div id="pano"></div>`);
				const panoramaOptions = {
					position: nearStreetViewLocation,
					pov: {
						heading: heading,
						pitch: 50
					}
				}
				const panorama = new google.maps.StreetViewPanorama(
					document.querySelector('#pano'), panoramaOptions);
			} else {
				infoWin.setContent(
					`<div>${marker.title}</div>
					<div> No street view found </div>`);
			}
		}
		streetViewServce.getPanoramaByLocation(marker.position, radius, getStreetView);
		infoWin.open(map, marker);
	}
}

const showListings = () => {
	const bounds = new google.maps.LatLngBounds();
	markers.forEach(marker => {
		marker.setMap(map)
		bounds.extend(marker.position);
	})
	map.fitBounds(bounds);
}

const hideListings = () => {
	markers.forEach(marker => {
		marker.setMap(null);
	})
}

const makeMarkerIcon = (markerColor) => {
	const markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 30));
	return markerImage;
}

const toggleDrawing = ( drawingManager ) => {
	if ( drawingManager.map ) {
		drawingManager.setMap(null)
		if ( polygon ) {
			polygon.setMap(null)
		}
	} else {
		drawingManager.setMap(map);
	}
}

const searchWithinPolygon = () => {
	for (let i = 0; i < markers.length; i++) {
		if ( google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
			markers[i].setMap(map);
		} else {
			markers[i].setMap(null);
		}
	}
}

const geocoderAddress = (geocoder, resultMaps) => {
	const address = document.querySelector('#zoom-to-area-text').value;
	
	geocoder.geocode(
		{ address: address }, function (results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				resultMaps.setCenter(results[0].geometry.location)
				console.log('results[0]', results[0])
				map.setZoom(15);
				document.getElementById('firstComponent').innerHTML = results[0].formatted_address; 
				document.getElementById('secondComponent').innerHTML = results[0].geometry.location;
			} else {
				window.alert('We could not find that location - try entering a more specific place');
			}
		}

	)
}

const searchWithinTime = () => {

	const distanceMatrixService = new google.maps.DistanceMatrixService; 
	const address = document.querySelector('#search-within-time-text').value;

	if( address === '' ) {
		window.alert('You must enter an address.');
	} else {
		hideListings();

		const origins = [];
		for (let i = 0; i < markers.length; i++) {
			origins[i] = markers[i].position;	
		}
		const destination = address;
		const mode = document.querySelector('#mode').value

		distanceMatrixService.getDistanceMatrix({
			origins: origins,
			destinations: [destination],
			travelMode: google.maps.TravelMode[mode],
			unitSystem: google.maps.UnitSystem.IMPERIAL
		}, function (response, status) {
			if( status !== google.maps.DistanceMatrixStatus.OK) {
				window.alert('Error was: ' + status);
			} else {
				displayMarkersWithinTime(response);
			}
		})
	}
}

const displayMarkersWithinTime = response => {
	const maxDuration = document.querySelector('#max-duration').value;
	const origins = response.originAddresses;
	const destinations = response.destinationAddresses;

	let atLeastOne = false;

	for (let i = 0; i < origins.length; i++) {
		const results = response.rows[i].elements;
		for (let j = 0; j < results.length; j++) {
			const element = results[j];
			if(element.status === 'OK') {

				const distanceText = element.distance.text;
				const duration = element.duration.value / 60;
				const durationText = element.duration.text;

				if(duration <= maxDuration) {
					markers[i].setMap(map);
					atLeastOne = true;

					const infoWindow = new google.maps.InfoWindow({
						content: `${durationText} away, ${distanceText}` 
					});
					infoWindow.open(map, markers[i]);

					markers[i].infoWindow = infoWindow;

					google.maps.event.addListener(markers[i], 'click', function() {
						this.infoWindow.close();
					})
				}
			}
		}
	}
}