var ElementHider = function(elementID){
    this.element = document.getElementById(elementID);
};
ElementHider.prototype.hide = function(){
    this.element.setAttribute("hidden", "true");
};
ElementHider.prototype.show = function(){
    this.element.removeAttribute("hidden")
};

// ################ CRASHUP ######################################
		
var nextButton;
var prevButton;
var playButton;
var restartButton;
var monthHeatButton;
var yearHeatButton;
var nextMonthButton;
var prevMonthButton;
var nextyearButton;
var prevYearButton;
var allFatalIncidentsButton;

var calHeatMap;
var dataUtils;
var leafletMap;
var uiElements;
var yuiSlider;
var yearSelector;
var monthSelector;
var loadingImg;

var controls;
var sliderLength;

var currentDate;
var currentYear;		
var playing;
var sliding = false;
var maxYear = 2013;
var updateMS = 100;
var stepButtonClicked = false;
var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

var calHeatMapOnClick;
var sliderInit;
var getSliderLength;

function CrashUp(startingYear){
	currentYear = startingYear;
	playing = false;
	updateMS = 100;
	this.timerID = 0;

	currentDate = new Date(startingYear + " 01 01");

    controls = document.getElementById('controls');

    sliderLength = controls.clientWidth - 20;

    // Important classes
	dataUtils = new DataUtils(currentYear);
	leafletMap = new LeafletMap("map");
	yuiSlider = new YUISlider(".date-slider");
	calHeatMap = new CalHeatmap("#cal-heatmap");
	uiElements = new UIElements();

    // Combo boxes / selectors
    yearSelector = new YUIComboBox("#year-selector");
	monthSelector = new YUIComboBox("#month-selector");

    // Buttons
	prevButton = new ControlButton("prev-button");
	nextButton = new ControlButton("next-button");
	playButton = new ControlButton("play-button");
	restartButton = new ControlButton("restart-button");
    monthHeatButton = new ControlButton("whole-month");
    yearHeatButton = new ControlButton("whole-year");
    nextMonthButton = new ControlButton("next-month-button");
    prevMonthButton = new ControlButton("prev-month-button");
    nextyearButton = new ControlButton("next-year-button");
    prevYearButton = new ControlButton("prev-year-button");
    allFatalIncidentsButton = new ControlButton("show-all-fatal-incidents");

    loadingImg = new ElementHider("loading-img");
    loadingImg.hide();


    // Pro tip: in Javascript, calling own class's prototype functions from other context (eg onclick)
    // loses context of class, even though it's the own classes functions.. This is (partly)
    // why JS creates bad programmers..

    // VERY USEFUL!!
    var me = this;

    uiElements.updateDate(currentDate);

    window.onresize = function(event){
        sliderLength = controls.clientWidth - 20;
        yuiSlider.resize(sliderLength);
    };

    getSliderLength = function(){
        return controls.clientWidth - 20;
    };

    calHeatMapOnClick = function(date, val){
        var prevDate = currentDate.getDOY();
        var newDate = date.getDOY();
        var deltaDays = (newDate - prevDate);

        if(!playing){
            currentDate.setDate(date.getDate());
            leafletMap.renderHeatDay(currentDate, 1);
            calHeatMap.update(currentDate);
            leafletMap.renderFatalMarkersInRange(currentDate, deltaDays);
            leafletMap.dropAccidentsOnDay(currentDate, 1);
            yuiSlider.updateDay(currentDate);
            uiElements.updateDate(currentDate);

        }

        console.log("Date clicked: " + date.toDateString());
    };

    leafletMap.setFatalIncidentDropCallback(function(fatalIncidentCount){
        //console.log("Fatal Incident callback!! " + fatalIncidentCount);
        uiElements.updateCurrentFatalIncidentCount(fatalIncidentCount);
    });

    allFatalIncidentsButton.onButtonClick(function(){
        var prevDate = currentDate;
        currentDate = new Date(currentDate.getFullYear(), 11, 31);
        var deltaDays = currentDate.getDOY() - prevDate.getDOY();
        leafletMap.renderFatalMarkersInRange(currentDate, deltaDays);
        leafletMap.renderHeatDay(currentDate, 7);
        playing = false;
        calHeatMap.update(currentDate);
        monthSelector.setValue(monthNames[currentDate.getMonth()]);
        uiElements.updateDate(currentDate);
        yuiSlider.updateDay(currentDate);
    });

    loadingImg.show();
    // Load year data and send to stuff that utilises it
    dataUtils.loadYearJSON(""+currentYear, function(data){

        // Initialise crash map - start on Jan 1 2007
        me.checkDataBoundsAndUpdateUI();
        leafletMap.loadYearData(data, 365);
        calHeatMap.initialise(data, currentDate, calHeatMapOnClick);
        leafletMap.renderHeatDay(currentDate, 7);
        leafletMap.renderFatalMarkers(currentDate);
        leafletMap.dropAccidentsOnDay(currentDate, 7);
        loadingImg.hide();
        uiElements.setYearFatalIncidentCount(leafletMap.getYearFatalIncidentCount());
    });

    sliderInit = function(){
        // create slider callbacks when slider has rendered - important to put here not anywhere else!
        yuiSlider.onSlideStart(function(){
            sliding = true;
            // Set playing state to false and hide markers
            playing = false;
            uiElements.showPlay();
            leafletMap.clearIncidentMarkers();
            leafletMap.disableInteraction();
            console.log("Sliding!!!");
        });
        yuiSlider.onSlideEnd(function(){
            sliding = false;
            console.log("Ended Sliding!!!");
            leafletMap.clearIncidentMarkers();
            leafletMap.enableInteraction();
            leafletMap.dropAccidentsOnDay(currentDate, 7);

        });

        yuiSlider.onValueChange(function(){

            var newDOY = +yuiSlider.getValue();
            var lastDOY = +currentDate.getDOY();
            var deltaDays = (newDOY - lastDOY);
            var newDate = new Date(currentDate.getDate() + deltaDays);

            //console.log("Slider moved: " + deltaDays + " from " + currentDate.getDOY() + " to " + yuiSlider.getValue());

            // When stopped sliding, display accident markers
            if(!playing){
                if(!stepButtonClicked){
                    currentDate.setDate(currentDate.getDate() + deltaDays);
                } else{
                    stepButtonClicked = false;
                }
                monthSelector.setValue(monthNames[currentDate.getMonth()]);
                leafletMap.renderHeatDay(currentDate, 7);
                calHeatMap.update(currentDate);
                leafletMap.renderFatalMarkersInRange(currentDate, deltaDays);
                ///console.log("slider skipped " + deltaDays + " days.");
                if(!sliding){
                    leafletMap.dropAccidentsOnDay(currentDate, 7);
                }
            }
            //yuiSlider.updateDay(currentDate);
            //console.log("Slider moved:" + currentDate.toDateString());
            uiElements.updateDate(currentDate);
        });
    };

    // draw slider based on number of days in current year
    yuiSlider.renderSlider(currentDate.getDaysInYear(), controls.clientWidth - 20, sliderInit);

    var changeYear = function(data){
        calHeatMap.changeYear(data, currentDate, calHeatMapOnClick);
        var me = this;
        yuiSlider.reRender(currentDate.getDaysInYear(), controls.clientWidth - 20, sliderInit);
        leafletMap.loadYearData(data, currentDate.getDaysInYear());
        leafletMap.renderHeatDay(currentDate, 7);
        leafletMap.renderFatalMarkers(currentDate);
        leafletMap.dropAccidentsOnDay(currentDate, 7);
        loadingImg.hide();
        uiElements.setYearFatalIncidentCount(leafletMap.getYearFatalIncidentCount());
        uiElements.updateCurrentFatalIncidentCount(0);
    };

	yearSelector.getValueOnChange(function(value){
        loadingImg.show();
		console.log("year change: " + value);
		// Load year data and send to stuff that utilises it
		currentDate = new Date(+value, 0, 1);
        me.checkDataBoundsAndUpdateUI();
		uiElements.updateDate(currentDate);
		yuiSlider.updateDay(currentDate);
		leafletMap.clearFatalIncidents();
		leafletMap.clearIncidentMarkers();
        monthSelector.setValue(monthNames[currentDate.getMonth()]);
		dataUtils.loadYearJSON(+value, changeYear);
	});

    monthSelector.getValueOnChange(function(month){
        var dateStr = month + " 1, " + " " + currentDate.getFullYear();
        var newDate = new Date(Date.parse(dateStr));
        var deltaDays = newDate.getDOY() - currentDate.getDOY();
        console.log(dateStr + "ddays " + deltaDays);
        currentDate = newDate;
        me.checkDataBoundsAndUpdateUI();
        uiElements.updateDate(currentDate);
        yuiSlider.updateDay(currentDate);
        leafletMap.renderFatalMarkersInRange(currentDate, deltaDays);
        calHeatMap.update(currentDate);
        leafletMap.dropAccidentsOnDay(currentDate, 7);
        leafletMap.renderHeatDay(currentDate, 7);
    });

	// Button click events
	playButton.onButtonClick(function(){
		
		console.log("play button clicked");
		console.log(me);
		if(playing){
			console.log("Paused");
			uiElements.showPlay();
			leafletMap.enableInteraction();
			leafletMap.dropAccidentsOnDay(currentDate, 7);
			
			//leafletMap.showFatalIncidents();
			playing = false;
			clearTimeout(me.timerID);
			
		} else {
			console.log("Playing!");
			uiElements.showPause();
			leafletMap.clearIncidentMarkers();
			leafletMap.disableInteraction();
			//leafletMap.hideFatalIncidents();
			playing = true;
			me.play();
			
		}
	});
	// On next button click - move to next day
	nextButton.onButtonClick(function(){
		if(!playing){
			
			console.log("next button clicked, increasing date by ONE DAY..");
			currentDate.setDate(currentDate.getDate() + 7);
			stepButtonClicked = true;
			yuiSlider.updateDay(currentDate);
			uiElements.updateDate(currentDate); 
			calHeatMap.update(currentDate);
			leafletMap.renderHeatDay(currentDate, 7);
			leafletMap.renderFatalMarkersInRange(currentDate, 7);
			leafletMap.dropAccidentsOnDay(currentDate, 7);	
		}
		
	});
	// On prev button click - move back one day
	prevButton.onButtonClick(function(){
		if(!playing){
			if(currentDate.getDOY() > 5){
				currentDate.setDate(currentDate.getDate() - 7);
				stepButtonClicked = true;
				yuiSlider.updateDay(currentDate);

				calHeatMap.update(currentDate);
				uiElements.updateDate(currentDate); 
				leafletMap.renderHeatDay(currentDate, 7);
				leafletMap.renderFatalMarkersInRange(currentDate, 7);
				leafletMap.dropAccidentsOnDay(currentDate, 7);	
			}
		}
	});

	restartButton.onButtonClick(function(){
		var currentYear = currentDate.getFullYear();
		currentDate = new Date(currentYear, 0, 1);
		leafletMap.clearIncidentMarkers();
		leafletMap.clearFatalIncidents();
		uiElements.updateDate(currentDate);
		yuiSlider.updateDay(currentDate);
		calHeatMap.resetYear();
        uiElements.updateCurrentFatalIncidentCount(0);
	});

    monthHeatButton.onButtonClick(function(){
        var endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() +1, 0).getDate();
        me.checkDataBoundsAndUpdateUI();
        currentDate.setDate(endOfMonth);
        calHeatMap.update(currentDate);
        uiElements.updateDate(currentDate);
        yuiSlider.updateDay(currentDate);
        leafletMap.clearFatalIncidents();
        leafletMap.clearIncidentMarkers();
        leafletMap.renderHeatDay(currentDate, endOfMonth);
    });

    yearHeatButton.onButtonClick(function(){
        var endOfYear = currentDate.getDaysInYear();
        console.log("days in year: " + endOfYear);
        currentDate = new Date(currentDate.getFullYear(), 11, 31);
        me.checkDataBoundsAndUpdateUI();
        calHeatMap.update(currentDate);
        uiElements.updateDate(currentDate);
        yuiSlider.updateDay(currentDate);
        leafletMap.clearFatalIncidents();
        leafletMap.clearIncidentMarkers();
        leafletMap.renderFatalMarkersInRange(currentDate, currentDate.getDaysInYear());
        leafletMap.renderHeatDay(currentDate, endOfYear);
    });

    nextMonthButton.onButtonClick(function(){
        var newDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1);
        if(currentDate.getFullYear() == maxYear && currentDate.getMonth() == 11){
            return;
        }
        if(currentDate.getMonth() == 11){
            dataUtils.loadYearJSON(currentDate.getFullYear() + 1, changeYear);
            yearSelector.setValue(""+newDate.getFullYear());
        }
        currentDate = newDate;
        me.checkDataBoundsAndUpdateUI();

        monthSelector.setValue(monthNames[currentDate.getMonth()]);
        calHeatMap.update(currentDate);
        uiElements.updateDate(currentDate);
        leafletMap.renderHeatDay(currentDate, 7);
        leafletMap.dropAccidentsOnDay(currentDate, 7);
    });
    prevMonthButton.onButtonClick(function(){
        var newDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1);
        if(currentDate.getFullYear() == startingYear && currentDate.getMonth() == 0){
            return;
        }
        //TODO: change year or disable button?
        if(currentDate.getMonth() == 0){
            dataUtils.loadYearJSON(currentDate.getFullYear() - 1, changeYear);
            yearSelector.setValue(""+newDate.getFullYear());
        }
        currentDate = newDate;
        me.checkDataBoundsAndUpdateUI();

        monthSelector.setValue(monthNames[currentDate.getMonth()]);
        calHeatMap.update(currentDate);
        uiElements.updateDate(currentDate);
        leafletMap.renderHeatDay(currentDate, 7);
        leafletMap.dropAccidentsOnDay(currentDate, 7);

    });
    nextyearButton.onButtonClick(function(){
        if(currentDate.getFullYear() < maxYear){
            currentDate = new Date(currentDate.getFullYear() + 1, 0, 1);
            me.checkDataBoundsAndUpdateUI();
            uiElements.updateDate(currentDate);
            yuiSlider.updateDay(currentDate);
            leafletMap.clearFatalIncidents();
            leafletMap.clearIncidentMarkers();
            yearSelector.setValue(""+currentDate.getFullYear());
            loadingImg.show();
            monthSelector.setValue(monthNames[currentDate.getMonth()]);
            dataUtils.loadYearJSON(currentDate.getFullYear(), changeYear);
        }
    });
    prevYearButton.onButtonClick(function(){
        if(currentDate.getFullYear() > startingYear){
            currentDate = new Date(currentDate.getFullYear() - 1, 0, 1);
            me.checkDataBoundsAndUpdateUI();
            uiElements.updateDate(currentDate);
            yuiSlider.updateDay(currentDate);
            leafletMap.clearFatalIncidents();
            leafletMap.clearIncidentMarkers();
            yearSelector.setValue(""+currentDate.getFullYear());
            loadingImg.show();
            monthSelector.setValue(monthNames[currentDate.getMonth()]);
            dataUtils.loadYearJSON(currentDate.getFullYear(), changeYear);

        }
    });
};

CrashUp.prototype.checkDataBoundsAndUpdateUI = function(){
    // Data start
    if(currentDate.getFullYear() == 2007){
        prevYearButton.hide();
        if (currentDate.getMonth() == 0){
            prevMonthButton.hide();
        } else{
            prevMonthButton.show();
        }
    } else{
        prevYearButton.show();
        prevMonthButton.show();
    }
     // Data end
    if(currentDate.getFullYear() == 2013){
        nextyearButton.hide();
        if(currentDate.getMonth() == 11){
            nextMonthButton.hide();
        } else {
            nextMonthButton.show();
        }
    } else {
        nextyearButton.show();
        nextMonthButton.show();
    }
}

CrashUp.prototype.play = function(){

	var me = this;
	
	if(playing){

        var nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        if(nextDate.getMonth() != currentDate.getMonth()){
            me.checkDataBoundsAndUpdateUI();
        }

        if (nextDate.getFullYear() > currentDate.getFullYear()){
            console.log("Paused");
            uiElements.showPlay();
            leafletMap.enableInteraction();
            leafletMap.dropAccidentsOnDay(currentDate, 7);

            //leafletMap.showFatalIncidents();
            playing = false;
            clearTimeout(me.timerID);

        } else {
            currentDate.setDate(currentDate.getDate() + 1 );
            calHeatMap.update(currentDate);
            leafletMap.renderHeatDay(currentDate, 7);
            leafletMap.renderFatalMarkers(currentDate);
            yuiSlider.updateDay(currentDate);
            monthSelector.setValue(monthNames[currentDate.getMonth()]);
            uiElements.updateDate(currentDate);


            this.timerID = setTimeout(function(){
                me.play();
            }, updateMS);
        }
	} else {
		console.log("Can't play whilst paused!!");
	}
	
};