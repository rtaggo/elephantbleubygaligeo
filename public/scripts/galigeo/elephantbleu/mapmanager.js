(function() {
	'use strict';
	GGO.MapManager = function(options){
		this._options = options || {};
		this._options.mapboxAccessToken = this._options.mapboxAccessToken || 'pk.eyJ1IjoicnRhZ2dvIiwiYSI6Ijg5YWI5YzlkYzJiYzg2Mjg2YWQyMTQyZjRkZWFiMWM5In0._yZGbo26CQle1_JfHPxWzg';
		this._options.mapDivId = this._options.mapDivId || 'map';
		L.mapbox.accessToken = this._options.mapboxAccessToken;

		this._defaultIcon = {
			iconUrl: '/images/logo_elephantbleu.png',
			iconSize: [32, 32], // size of the icon
			iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
			popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
			className: 'dot'
		};
		this._currentRadius = 70;
		this._stationsFetched = false;
		this._userLocation = {
			orientation: 0
		}
		this.init();
	};

	GGO.MapManager.prototype = {
		init:function(){
			this.setupListeners();
			this.setupMap();
		},
		setupListeners:function(){
			var self = this;
			GGO.EventBus.addEventListener(GGO.EVENTS.APPISREADY, function(e) {
				console.log('Received GGO.EVENTS.APPISREADY');
				self.locateUser();
			});

			GGO.EventBus.addEventListener(GGO.EVENTS.CLICKEDSTATION, function(e) {
				var tgt = e.target;
				console.log('Received GGO.EVENTS.CLICKEDSTATION', tgt);
				self.routeToStation(tgt);
			});			
		},
		formatDistance: function(distanceKM){
			if (distanceKM<1) {
				return (distanceKM * 1000).toFixed(0) + ' m'; 
			} else {
				return distanceKM.toFixed(2) + ' km';
			}
		},			
		routeToStation: function(destination){
			var self = this;
			var startPositionLatLng = this._userLocation.coordinates;
			var toPositionLatLng = {lat: destination.geometry.coordinates[1], lng: destination.geometry.coordinates[0]};
        	var startEndPosition = 'point='+startPositionLatLng.lat+','+startPositionLatLng.lng+'&point='+toPositionLatLng.lat+','+toPositionLatLng.lng;
        	var routeUrl = 'https://galigeogeoservice.herokuapp.com/rest/1.0/geoservice/route?' + startEndPosition + '&vehicle=car&points_encoded=false';
        	$.ajax({
				type: 'GET',
				url: routeUrl,
				success: function(data) {
					console.log('Route response: ', data);
					var coords = data.paths[0].points.coordinates;
					coords.unshift([startPositionLatLng.lng, startPositionLatLng.lat]);
					coords.push([toPositionLatLng.lng, toPositionLatLng.lat]);
					if (typeof(self._routeLayer) === 'undefined') {
						self._routeLayer = L.mapbox.featureLayer().addTo(self._map);
					}
					var path = turf.lineString(coords, {
	                    "stroke": "#73cfff",
	                    "stroke-width": 2,
	                    "opacity":1
	                });
					self._routeLayer
						.clearLayers()
						.setGeoJSON(path);
					//self.map.flyToBounds(self._routeLayer.getBounds(), {padding: L.point(50,50)});
					self._map.fitBounds(self._routeLayer.getBounds(), {padding: L.point(50,50)});
					window.setTimeout(function(){
						$('path').css('stroke-dashoffset',0);
					},1000);
					//var infoContent = self._formatDuration(data.paths[0].time);// + ' (' + self._formatDistance(data.paths[0].distance) + ')';
					var infoContent = self.formatDistance(data.paths[0].distance/1000); // + ' (' + self._formatDuration(data.paths[0].time) + ')'; 
					L.marker([coords[parseInt(coords.length*0.5)][1],coords[parseInt(coords.length*0.5)][0]],{
                        icon: L.divIcon({
                            className: 'distance-icon',
                            html: '<strong style="color:#73cfff; font-size:10px;line-height: 12px;vertical-align:middle;">'+infoContent+'</strong>',
                            iconSize: [65, 25]
                        })})
                    .addTo(self._routeLayer);
					self._routeLayer.bringToFront();
				},
				error:  function(jqXHR, textStatus, errorThrown) { 
					if (textStatus === 'abort') {
						console.warn('Route request aborted');
					} else {
						console.error('Error for Routerequest: ' + textStatus, errorThrown);
					}
				}
			});
		},
		getMap: function() {
			return this._map;
		},
		setupMap: function() {
			var self = this;
			var stamen_tonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
				attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				subdomains: 'abcd',
				minZoom: 0,
				maxZoom: 20,
				ext: 'png'
			});
			/*
			*/
			var OpenMapSurfer_Grayscale = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
				maxZoom: 19,
				attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			});
			var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			});

			var esriGrey    = L.tileLayer('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
				attribution: "© Galigeo | ESRI",
				minZoom: 1,
    			maxZoom: 15,    
			});
			
			var mapDivId = this._options.mapDivId || 'map';
			this._map = L.map(mapDivId, {
				attributionControl: false,
				preferCanvas: true,
				zoomControl: false,
				contextmenu: true,
				contextmenuWidth: 140,						
				layers: [esriGrey]
			}).setView([0, 0], 2);
			/*
			new L.control.zoom({
				position:'topright'
			}).addTo(this._map);
			*/
			var onLocationFound  = function(e) {
				self.handleUserLocationFound(e);
			};
			var onLocationError = function(e) {
				self.handleUserLocationError(e);
			};
			this._map.on('locationfound', onLocationFound);
			this._map.on('locationerror', onLocationError);
		},
		locateUser: function() {
			this._map.locate({setView: true, maxZoom: 14,enableHighAccuracy: true});
		},
		handleUserLocationFound: function(e) {
			console.log('>> handleUserLocationFound', e);
			var obj = {
				id: 1, 
				name: 'Current position', 
				position: { lat: e.latlng.lat, lng: e.latlng.lng }
			};
			var data2Send = {
				lat: e.latlng.lat, 
				lng: e.latlng.lng 
			};
			this._userLocation.coordinates = data2Send;
			this._userLocation.accuracy =  e.accuracy;
			GGO.EventBus.dispatch(GGO.EVENTS.USERLOCATIONCHANGED, data2Send);
			if (!this._stationsFetched) {
				GGO.EventBus.dispatch(GGO.EVENTS.FETCHSTATIONS);
			}
			this.displayUserLocation();
		}, 
		handleUserLocationError: function(e) {
			console.log('>> handleUserLocationError', e);
			this._userLocation.coordinates = {
          		lat: 48.8535356452292,
				lng: 2.3482337594032288
			};
			this._userLocation.accuracy = 1;
			if (!this._stationsFetched) {
				GGO.EventBus.dispatch(GGO.EVENTS.FETCHSTATIONS);
			}
			this.displayUserLocation();
		},
		displayUserLocation: function() {
			var self = this;
			if (typeof(this._userLocation.layer) === 'undefined') {
				this._userLocation.layer = L.mapbox.featureLayer().addTo(this._map);
			}
			/*
			else if (this._map.hasLayer(this._userLocation.layer)) {
				this._map.removeLayer(this._userLocation.layer);
			} 
			*/
			var center = [this._userLocation.coordinates.lng, this._userLocation.coordinates.lat];
			var radius = this._userLocation.accuracy / 1000;
			var options = {steps: 120, units: 'kilometers', 
				properties: {
					"stroke": "#176fff",
					"stroke-width": 1,
					"stroke-opacity": 0.4,
					"fill": "#488dff",
					"fill-opacity": 0.1,
    			}
			};
			var locationAccuracy = turf.circle(center, radius, options);
			var locationMarker = turf.point(center, {'name': 'user_location'});

			this._userLocation.layer.setGeoJSON(turf.featureCollection([locationAccuracy,locationMarker]));
			this._userLocation.layer.eachLayer(function(lyr){
				console.log('_userLocation.layer', lyr);
				if (lyr.feature.properties.name === 'user_location') {
					var circleM = L.divIcon({
						className: 'userLocationMarker',
						iconSize : [10,10],
						iconAnchor: [4, 6]
					});
					lyr.setIcon(circleM);
				}
			});
		},
		setStationsResponse: function(data) {
			var self = this;
			self._stationsFetched = true;
			self._stationsGeoJSON = data;
			if ((typeof(self._stationsLayer) !== 'undefined' ) && (self._stationsLayer !== null)) {
				self._stationsLayer.clearLayers();				
			} else {
				self._stationsLayer = L.mapbox.featureLayer();
				self._stationsLayer.addTo(self._map);
			}
			var dataToDisplay = self._stationsGeoJSON;
			if (typeof(self._userLocation.coordinates) !== 'undefined') {
				var point = [self._userLocation.coordinates.lng, self._userLocation.coordinates.lat];
				var bufferLayer = L.mapbox.featureLayer().addTo(this._map);
				var buffer = this.getBuffer(point, self._currentRadius, 'kilometers', 120);
				buffer.properties = {
	                "fill": "#92BA11",
	                "fill-opacity":0.04,
	                "stroke": "#92BA11",
	                "stroke-width": 1,
	                "stroke-opacity": 0.2,
	                "whatiam": "Buffer Layer"
	            };

		        bufferLayer.setGeoJSON(buffer);

	           	dataToDisplay = turf.featureCollection(self._stationsGeoJSON.features.filter(function(station){
		            var dist = turf.distance(station, point, {units: 'kilometers'});
		            if (dist <= self._currentRadius) {
		            	station.properties.distance = dist;
		            	
		            	return true;
		            }
		        }));		       
			} 
			self._stationsLayer.setGeoJSON(dataToDisplay);
			self._stationsLayer.eachLayer(function(lyr){
				lyr.setIcon(L.icon(self._defaultIcon));
				var props = lyr.feature.properties;
				var popupcontent = '<span class="station-title">' + props.nom+'</span>';
            	var hasAddress = false;
            	var addrContent = '';
            	if (typeof(props.adresse) !== 'undefined' && props.adresse !== '') {
            		addrContent += '<span style="display: inline-block;">' + props.adresse + '</span>';
            		hasAddress = true;
            	}
            	var addrField = [];
            	if (typeof(props.code_postal) !== 'undefined' && props.code_postal !== '') {
            		addrField.push(props.code_postal);
            		hasAddress = true;
            	}		            	
            	if (typeof(props.ville) !== 'undefined' && props.ville !== '') {
            		addrField.push(props.ville);
            		hasAddress = true;
            	}
            	if (addrField.length > 0) {
            		addrContent += '<span style="display: inline-block;">' + addrField.join(' - ');
            	}
            	if (hasAddress) {
	            	popupcontent += '<div class="address-content">';
	            	popupcontent += ' <div style="float: left;"><i class="fa fa-map-marker"></i></div>';
	            	popupcontent += ' <div style="margin-left: 20px;">'+addrContent+'</div>';
	            	popupcontent += '</div>';
	            }

	            var hasServices = false;            
	            var servicesContent = '<div class="services-content">';
	            servicesContent += '<div class="services-title">Services proposés</div>';
				var picto_hp = "<img src='./images/pictos/picto_hp.png' alt='' width='20px' height='20px'/>";
		        var picto_portique = "<img src='./images/pictos/picto_portique.png' alt='' width='20px' height='20px'/>";
    		    var picto_aspi = "<img src='./images/pictos/picto_aspirateur.png' alt='' width='20px' height='20px'/>";
        		var picto_gonfleur = "<img src='./images/pictos/picto_gonfleur.png' alt='' width='20px' height='20px'/>";
    
	            if (props.piste_hp !== null && props.piste_hp>0) {
	            	servicesContent += '<div class="service-type">';
	            	//servicesContent += '<img src="./images/logo_elephantbleu.png"/><span>' + station.properties.piste_hp + ' Piste(s) Haute pression</span>';
	            	servicesContent += picto_hp + '<span>' + props.piste_hp + ' Piste(s) Haute pression</span>';
	            	servicesContent += '</div>';
					hasServices = true;
	            }
	            if (props.piste_pl) {
	            	servicesContent += '<div class="service-type">';
	            	servicesContent += picto_hp + '<span> Piste utilitaires</span>';;
	            	servicesContent += '</div>';
					hasServices = true;
	            }
	            if (props.rouleau_lavage !== null && props.rouleau_lavage>0) {
	            	servicesContent += '<div class="service-type">';
	            	servicesContent += picto_portique + '<span>' + props.rouleau_lavage + ' Rouleau(x) de lavage</span>';
	            	servicesContent += '</div>';
					hasServices = true;
	            }
	            if (props.gonfleur) {
	            	servicesContent += '<div class="service-type">';
	            	servicesContent += picto_aspi+'<span>Gonfleur</span>';
	            	servicesContent += '</div>';
					hasServices = true;
	            }
	            if (props.aspirateur !== null && props.aspirateur>0) {
	            	servicesContent += '<div class="service-type">';
	            	servicesContent += picto_gonfleur+'<span>' + props.aspirateur + ' Aspirateur(s)</span>';
	            	servicesContent += '</div>';
					hasServices = true;
	            }
				servicesContent += '</div>';
				if (hasServices) {
					popupcontent+=servicesContent;
				}
				lyr.bindPopup(popupcontent);

			});
			 this._stationsLayer
		        .off()
		        /*
		        .on('mouseover', function(e) {
		            e.layer.openPopup();
		        })
		        .on('mouseout', function(e) {
		            e.layer.closePopup();
		        })*/
		        .on('click', function(e){
		            e.layer.openPopup();
		        });
			self._map.fitBounds(self._stationsLayer.getBounds());
			GGO.EventBus.dispatch(GGO.EVENTS.STATIONSFILTERED, dataToDisplay);
			self.updateMapSize();
		},
		updateMapSize: function() {
			$('#map').addClass('halfheight_map');
			this._map.invalidateSize(false);					
		},
		invalidateMapSize: function() {
			this._map.invalidateSize(false);					
		},
		getBuffer: function(center, radius, units, resolution) {
			var options = {steps: resolution, units: units};
			var circle = turf.circle(center, radius, options);
			return circle;
		},

	};
})();