// ############### Leaflet map - load data directly, better plugin (heatmap) support !! ####

var currentYearData = [];
var heatLayer;
var incidentMarkerLayer;
var fatalIncidentsLayer;
var map;
var fatalMarkerDays = [];
var yearFatalIncidentCount = 0;
var droppedFatalIncidentCount = 0;
var fatalIndicentCallback;

function LeafletMap(mapID){
	
	// TODO: Icons with Icon.extend - http://leafletjs.com/examples/custom-icons.html
	
	// Create map with no attribution
	map = L.map(mapID, {attributionControl: false, zoomControl: false}).setView([-42.881321987572, 147.3328511961707], 7);
	
	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
	
	// Add back attribution in the right place, because we care..	
	//TODO: data link
	var attribution = L.control.attribution({prefix: 'Data obtained from <a href="#">data.gov.au</a>', position: 'topright'}).addTo(map);
	var zoomControl = L.control.zoom({position:'topright'}).addTo(map);
};

LeafletMap.prototype.loadYearData = function(yearData, daysInYear){
	var fromProj = "+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"; 
	var toProj = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
	
	// Reset current year data!
	currentYearData = [];

    yearFatalIncidentCount = 0;
	
	fatalIncidentsLayer = new L.layerGroup().addTo(map);

    // isLeap = new Date(year, 1, 29).getMonth() == 1
	// TODO: calc days in year
	//var daysInYear = 365;
	
	// Add crash data per day to be rendered later
	for (var i = 0; i < daysInYear; i++){
		for(var j = 0; j < yearData.result.records.length; j++){
			
			var cDateDOY = new Date(yearData.result.records[j]['dt']).getDOY();
			
			// Create empty array for each day of the year to append new crash events to
			if(currentYearData[i] == undefined){
					currentYearData[i] = [];
			}
			if(cDateDOY == i){
				if(currentYearData[i] == null){
					currentYearData[i] = [];
				}
				//console.log("Adding result for day " + i + " " + yearData.result.records[j]);
				var tmpData =  yearData.result.records[j];
                //console.log(tmpData);
				coords = new proj4(fromProj, toProj, [tmpData.x,tmpData.y]);   //any object will do as long as it has 'x' and 'y' properties
				tmpData.lat = coords[1];
				tmpData.lon = coords[0];
				tmpData.x = null;
				tmpData.y = null;
                tmpData.ct = yearData.result.records[j].ct;
                tmpData.sev = yearData.result.records[j].sev;
                //console.log(parseInt(tmpData.sev));

                if(parseInt(tmpData.sev) == 6){
                    yearFatalIncidentCount++;
                }
				/* default data properties
				 * ct: count
				 * dt: date (YYYY-MM-DD)
				 * lat: latittude
				 * lon: longtitude
				 * sev: severity
				 */				
				currentYearData[i].push(tmpData);
			}
		}	
	}
    console.log("Total fatal incidents this year: " + yearFatalIncidentCount);
};
LeafletMap.prototype.getYearFatalIncidentCount = function(){
    return yearFatalIncidentCount;
}
LeafletMap.prototype.hideFatalIncidents = function(){
	map.removeLayer(fatalIncidentsLayer);
};
LeafletMap.prototype.showFatalIncidents = function(){
	map.addLayer(fatalIncidentsLayer);
}

// Clear fatal incidents when changing year
LeafletMap.prototype.clearFatalIncidents = function(){
	fatalMarkerDays = [];
    droppedFatalIncidentCount = 0;
	map.removeLayer(fatalIncidentsLayer);
	fatalIncidentLayer = null;
};

LeafletMap.prototype.setFatalIncidentDropCallback = function(callback){
    fatalIndicentCallback = callback;
}

LeafletMap.prototype.dropFatalMarker = function(eventInfo){
	
	var fatalIconName = "fatal-marker";
	var markerDims = [64, 64];
	
	// TODO: shadows
	var fatalMarkerIcon = L.icon({
		iconUrl: './images/' + fatalIconName + '.png',
		iconSize: markerDims,
		shadowSize: markerDims,
		iconAnchor: [markerDims[0] * 0.5, markerDims[1] * 0.96],
		shadowAnchor: [0,0],
		popupAnchor: [0, -markerDims[1] * 0.95]
	}); 
	
	var markerText = "Fatal Incident! on " + eventInfo.dt + ": <br>Severity: " + eventInfo.sev + "<br/>Count: " + eventInfo.ct;
	var incidentMarker = L.marker([eventInfo.lat, eventInfo.lon], {
		icon: fatalMarkerIcon, 
		bounceOnAdd: true, 
    	bounceOnAddOptions: {
    		duration: 500, height: 100 } }).bindPopup(markerText);
    		
	fatalIncidentsLayer.addLayer(incidentMarker);
};


LeafletMap.prototype.renderFatalMarkersInRange = function(day, range){
    if(!map.hasLayer(fatalIncidentsLayer)){
        fatalIncidentsLayer = new L.layerGroup().addTo(map);
    }
	
	for(var i = 0; i < range; i++){
		var dayNum = +day.getDOY() + 1 - i;
		if(dayNum > 0){
			
			var tmpDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
			tmpDate.setDate(day.getDate() - i);
			//console.log("Rendering date " + i + ", " + tmpDate.toDateString());
			this.renderFatalMarkers(tmpDate);
		}
	}
};

// Look at current day's events and drop markers if there was a fatal incident :( 
LeafletMap.prototype.renderFatalMarkers = function(day){
	var currentDayEvents = [];
	//console.log("rendering fatal markers for date" + day.getDate());
	var dayNum = +day.getDOY() + 1;
	var eventsOnDay = currentYearData[dayNum];
    if(eventsOnDay != null){
        var fatalMarkers = [];

        var dayAlreadyRendered = false;
        var fatalIncidentDay = false;

        for(var i = 0; i < eventsOnDay.length; i++){
            if(eventsOnDay[i].sev == 6){
                for(var j = 0; j < fatalMarkerDays.length; j++){
                    if(fatalMarkerDays[j] == dayNum){
                        dayAlreadyRendered = true;
                    }
                }
                if(!dayAlreadyRendered){
                    setTimeout(this.dropFatalMarker, i * 100, eventsOnDay[i]);
                    droppedFatalIncidentCount++;
                    fatalIncidentDay = true;
                }
            }
        }
        if(!dayAlreadyRendered && fatalIncidentDay){
            fatalMarkerDays.push(dayNum);
            fatalIndicentCallback(droppedFatalIncidentCount);
        }

    }
	
	// Add fatal incidents layer to map if it's not already there
	//if(!map.hasLayer(fatalIncidentsLayer)){}
};

// Immediately render last few days of accidents, as a heatmap
LeafletMap.prototype.renderHeatDay = function(day, range){
	var eventsInRange = [];	

	for(var i = 0; i < range; i++){
		
		var dayNum = +day.getDOY() + 1 - i;
		var eventsOnDay = currentYearData[dayNum];
		
		if (eventsOnDay != undefined){
			//console.log("rendering day: " + dayNum + " i: " + i + " day: " + (day.getDOY() + 1));
			//console.log(eventsOnDay);
			for(var j = 0; j < eventsOnDay.length; j++){
				var dayData = [ eventsOnDay[j].lat, eventsOnDay[j].lon, eventsOnDay[j].ct ];
				
				// repeat to increase density???
				for(var k = 0; k < +eventsOnDay[j].ct; k++){
					eventsInRange.push(dayData);	
				}				
			}
		} else {
			//console.log("No events on day: " + dayNum);
		}
	}
	if(map.hasLayer(heatLayer)){
		heatLayer.setLatLngs(eventsInRange);
		//map.removeLayer(heatLayer);
		//heatLayer = null;
	} else {
		heatLayer = L.heatLayer(eventsInRange, {max: 2, radius: 20, blur: 10, maxZoom: 11}).addTo(map);	
	}	
};

// TODO: sort by severity
LeafletMap.prototype.dropAccidentsOnDay = function(day, range){
	console.log("dropping markers for day: " + day);
	var tempMarkers = [];
	
	if(map.hasLayer(incidentMarkerLayer)){
		map.removeLayer(incidentMarkerLayer);
		incidentMarkerLayer = null;
	}
	incidentMarkerLayer = new L.layerGroup().addTo(map);
	for(var i = 0; i < range; i++){
		var dayNum = +day.getDOY() + 1 - i;
		var eventsOnDay = currentYearData[dayNum];
		if(eventsOnDay != undefined){
			for(var j = 0; j < eventsOnDay.length; j++){
				if(eventsOnDay[j].sev < 6 && eventsOnDay[j].sev > 2){
					var markerIcon = this.getIconBySevAndAge(eventsOnDay[j].sev, i+1, range);
					setTimeout(this.addMarker, i * 60 + j * 30, eventsOnDay[j], markerIcon);
				}	
			}
		}
	}
};

LeafletMap.prototype.getIconBySevAndAge = function(sev, age, range){
	
	var markerAge = Math.floor(age/range) * 2;
	// console.log("Marker age: " + markerAge + " Severity: " + sev);
	// old large size: 50, 82
	// old mid size: 37, 61
	var iconSizes = [[25, 41], [25, 41], [12, 20]];	
	var markerDims = iconSizes[markerAge];
	var ageSize = ["1-5x", "1-5x", "1x"];
	var markerPrefix = "4359_0_marker-icon-";
	var sizeStr = ageSize[markerAge];
	var sevStr = "-" + (6-sev);
	var iconStr = markerPrefix + sizeStr + sevStr;
	
	// TODO: shadows
	return L.icon({
		iconUrl: './images/' + iconStr + '.png',
		iconSize: markerDims,
		shadowSize: markerDims,
		iconAnchor: [markerDims[0] * 0.5, markerDims[1] * 0.96],
		shadowAnchor: [0,0],
		popupAnchor: [0, markerDims[1] * -.75]
	}); 
};

LeafletMap.prototype.addMarker = function(eventInfo, markerIcon){
	var markerText = "Crash Info on " + eventInfo.dt + ": <br>Severity: " + eventInfo.sev + "<br/>Count: " + eventInfo.ct;
	var incidentMarker = L.marker([eventInfo.lat, eventInfo.lon], {
		icon: markerIcon, 
		bounceOnAdd: true, 
    	bounceOnAddOptions: {
    		duration: 500, height: 100 } }).bindPopup(markerText);
	incidentMarkerLayer.addLayer(incidentMarker);
};

LeafletMap.prototype.clearIncidentMarkers = function(){
	if(map.hasLayer(incidentMarkerLayer)){
		map.removeLayer(incidentMarkerLayer);
		incidentMarkerLayer = null;
	}
};

LeafletMap.prototype.disableInteraction = function(){
	// Disable panning & zooming (can crash some browsers XD)
	map.dragging.disable();
	map.touchZoom.disable();
	map.doubleClickZoom.disable();
	map.scrollWheelZoom.disable();
	map.boxZoom.disable();
	map.keyboard.disable();
};

LeafletMap.prototype.enableInteraction = function(){
	// re-enable zooming/panning
	map.dragging.enable();
	map.touchZoom.enable();
	map.doubleClickZoom.enable();
	map.scrollWheelZoom.enable();
	map.boxZoom.enable();
	map.keyboard.enable();
};
