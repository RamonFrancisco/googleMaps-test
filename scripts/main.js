'use strict';

const $map = document.querySelector('#map');
let map;


function initMap() {

	const markers = [];
	const locations = [
		{ title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
		{ title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
		{ title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
		{ title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
		{ title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
		{ title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
	];
	const infoWindow = new google.maps.InfoWindow();
	const bounds = new google.maps.LatLngBounds();

	map = new google.maps.Map($map , {
		center: { lat: 40.7413549, lng: -73.9980244 },
		zoom: 13
	});

	locations.forEach((location, idx) => {
		const position = location.location;
		const title = location.title;

		const marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: idx
		});

		markers.push(marker);

		bounds.extend(marker.position);

		marker.addListener('click', () => {
			populateInfoWindow(this, infoWindow);
		})

		const populateInfoWindow = (marker, infoWin) => {
			if( infoWin.marker != marker ) {
				infoWin.marker = marker;
				infoWin.setContent(`<div> ${ marker.title } </div>`)
				infoWin.open(map, marker);
				infoWin.addListener('closeClick', () => infoWin.setMarker(null));
			}
		}
	});


}