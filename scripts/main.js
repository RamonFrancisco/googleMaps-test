'use strict';

let map;
const $showListings = document.querySelector('#show-listings');
const $hideListings = document.querySelector('#hide-listings');
const $map = document.querySelector('#map');
const markers = [];

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

const drawing = new google.maps.drawing,DrawingManager({
	drawingMode: google.maps.drawing.OverlayType.POLYGON,
	drawingControl: true,
	drawingControlOptions: {
		position: google.maps.ControlPosition.TOP_LEFT,
		drawingModes: [
			google.maps.drawing.OverlayType.POLYGON
		]
	}
})

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

$showListings.addEventListener('click', showListings);
$hideListings.addEventListener('click', hideListings);
