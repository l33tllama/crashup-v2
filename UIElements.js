/* Super simple UI manipulation */

function UIElements(){
	this.playButtonIcon = document.getElementById("play-icon");
	this.pauseButtonIcon = document.getElementById("pause-icon");
	this.dateText = document.getElementById("current-date-text");
	this.yearText = document.getElementById("year-text");
    this.totalFatalIncidentText = document.getElementById("fatal-total");
    this.currentFatalIncidentCountText = document.getElementById("fatal-count");
    this.currentFatalIncidentCount = 0;

};

UIElements.prototype.showPlay = function(){
	this.pauseButtonIcon.hidden = true;
	this.playButtonIcon.hidden = false;
};
UIElements.prototype.showPause = function(){
	this.pauseButtonIcon.hidden = false;
	this.playButtonIcon.hidden = true;
};
UIElements.prototype.updateDate = function(date){
	var dateStr = date.toDateString();
	this.dateText.innerHTML = dateStr;//.substring(0, dateStr.length-4);
    this.yearText.innerHTML = date.getFullYear();
};
UIElements.prototype.setYearFatalIncidentCount = function(count){
    this.totalFatalIncidentText.innerHTML = count;
}
UIElements.prototype.updateCurrentFatalIncidentCount = function(count){
    this.currentFatalIncidentCountText.innerHTML = count;
};
UIElements.prototype.updateYear = function(date){
	
	this.yearText = date.getYear().toString()
};