// ############### Data Loading + Manipulating Functions ##########

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
/* Thanks http://www.htmlgoodies.com/html5/javascript/learn-how-to-use-javascript-dates-and-leap-years.html#fbid=zETwFkLF5WU */
Date.prototype.isLeapYear = function(utc) {
    var y = utc ? this.getUTCFullYear() : this.getFullYear();
    return !(y % 4) && (y % 100) || !(y % 400);
};

Date.prototype.getDaysInYear = function(){
    return this.isLeapYear(this.getUTCDate()) ? 366 : 365;
};
/* Thanks to http://javascript.about.com/library/bldayyear.htm 
Date.prototype.getDOY = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((this - onejan) / 86400000);
} */
// TODO: doesn't work with some browsers!! IDFK why...
Date.prototype.getDOY = function() { 
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((this - onejan) / 86400000); 
};
/*Date.getDOY = function(){
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((this - onejan) / 86400000);
};*/
/*Date.prototype.getFullYear = function(){
  return this.toDateString().substr(0, 4);
};*/

function DataUtils(startingYear){
	var currentYear = startingYear;
	var currentYearData = {};
	
};

DataUtils.prototype.loadYearJSON = function(year, callback){
	var yearFile = "./data-sources/" + year + ".json";
	
	d3.json(yearFile, function(err, json){
		if (err) return console.warn(err);
		// currentYearData = json;
		callback(json);
	});
};
