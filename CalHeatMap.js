// ########## Calheatmap Calendar ###################################
function CalHeatmap(elementID){

	this.lastUpdatedDate = null;
	this.initialised = false;
	this.changingMonth = false;
	this.elementID = elementID;
};

CalHeatmap.prototype.yearParser = function(data){

};


CalHeatmap.prototype.initialise = function(yearData, currentDate, onClickCallback){
	this.lastUpdatedDate = new Date(currentDate.getTime());

    var me = this;
    this.cal = new CalHeatMap({itemSelector: me.elementID});

    var yearParser = function(data){
        console.log("using year parser!!" + data.length);
        //console.log(data);
        var day_count = {};

        for (var i = 0; i < data.length; i++){
            // create date for cal_heatmap (in seconds..)
            var date = new Date(data[i]['dt']).getTime() / 1000;
            //console.log("Date?");
            //console.log(date);

            if(day_count[data[i]] == undefined){
                day_count[date] = +data[i]['ct'];
            } else {
                day_count[date] += +data[i]['ct'];
            }
        }
        return day_count;
    };

	console.log("Rendering cal-heatmap..");
    console.log(yearData.result.records.length);
    yearData = yearParser(yearData.result.records);
	console.log(yearData);


	this.cal.init({
		data: yearData,
		//afterLoadData: yearParser,
		domain: "month",
		subDomain: "day",
		start: new Date(currentDate.getFullYear() + " 01 01"),
		maxDate: new Date(currentDate.getFullYear() + "12 31"),
		range: 1,
		label: { 
			position: "left" 
		},
		legendColors: {
			min: "#c42",
			max: "#000",
			empty: "c42"
			// Will use the CSS for the missing keys
		},
        onClick: onClickCallback,
		legend: [0.0, 1.0, 2.0, 4.0],
        onComplete: function() {
            console.log("Calender rendered..");
        },
		itemName: ["accident", "accidents"]
	});
	
	this.initialised = true;
	// dataUtils.loadYearJSON(yearStr, function(yearData){	});
};
CalHeatmap.prototype.setChangingMonth = function(isChanging){
	this.changingMonth = isChanging;
	//console.log("Called a function..." + isChanging);
};
CalHeatmap.prototype.onClick = function(callback){
	this.cal.options.onClick = callback;
	//console.log("Yay spaghetti");
};
CalHeatmap.prototype.resetYear = function(){
	this.cal.jumpTo(new Date(currentDate.getFullYear() + " 01 01"));
};
CalHeatmap.prototype.changeYear = function(yearData, currentDate, onClickCallback){
	var me = this;
	if(this.initialised){
		this.cal.destroy(function(){
			me.cal = null;
			me.cal = new CalHeatMap({itemselector: me.elementID}); 
			me.initialise(yearData, currentDate, onClickCallback)
		});
	}
};

CalHeatmap.prototype.jumpTo = function(date){
    this.cal.jumpTo(date);
}

CalHeatmap.prototype.nextMonth = function(){
    this.cal.next();
};
CalHeatmap.prototype.prevMonth = function(){
    this.cal.previous();
    this.cal.jumpTo()
};
CalHeatmap.prototype.highlightDate = function(date){

};
/* TODO: move month checking to main */
CalHeatmap.prototype.update = function(currentDate){
	var lastMonth = this.lastUpdatedDate.getMonth();
	var newMonth = currentDate.getMonth();
	
	if(lastMonth < newMonth){
        for(var i = 0; i < newMonth - lastMonth; i++){
            this.cal.next();
        }
		this.changingMonth = true;	
	} else if (lastMonth > newMonth){
        for(var i = 0; i < lastMonth - newMonth; i++){
            this.cal.previous();
        }
		this.changingMonth = true;
	} else {
		if(this.changingMonth == false){
			this.cal.highlight(currentDate);
		}
		//console.log(this.changingMonth);
		
	}
	this.lastUpdatedDate = new Date(currentDate.getTime());
};
