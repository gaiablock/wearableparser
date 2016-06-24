/**
*  Gaiablock - Parse Amiigo wearable
*
* Manages events coming from sensors in the network

* @class parseAmiigo
*
* @package    Gaiablock.org open source project
* @copyright  Copyright (c) 2012 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* @version    $Id$
*/
var util = require('util');
var events = require("events");
var fs = require('fs');
var influxData = require("./influxdb.js");

var parseAmiigo = function(settingsIn) {

	events.EventEmitter.call(this);
	this.livedatabase = new influxData(settingsIn.account.influxdb);
	this.baseTimeWrist = 1439124342273;  // unix time milliseconds
	this.lasttimestamp = 1111;
	this.accTimestamp = 0;

	this.WristbandSettings();

	this.loglist = [];
	this.blist = [];
	this.results = [];
	this.bresults = [];
	this.commandlineFiles();

};

/**
* inherits core emitter class within this class
* @method
*/
util.inherits(parseAmiigo, events.EventEmitter);

/**
*  settings of amiigo wristband mode, record record frequency etc.
* @method WristbandSettings
*
*/
parseAmiigo.prototype.WristbandSettings = function() {
//console.log('settings on wrist band amiigo');
	wristSettings = {};
	wristSettings.mode = 'sleep'
	wristSettings.accelfrequency = 1; // depends on mode fast 0.05 slow 0.1 sleep 1 of a seconds recording
	wristSettings.lightfrequency = 4.2;  // every twelve seconds
	wristSettings.temperature = 1;  // every   seconds

	this.wristSetAt = wristSettings;

};

/**
*  serial flow utility function
* @method serialflow
*
*/
parseAmiigo.prototype.serialflow = function(item) {

	var localthis = this;
  if(item) {
    this.manageLogfiles(item, function(result) {
    	localthis.results.push(result);
			return localthis.serialflow(localthis.loglist.shift());
    });

  }
  else
  {
    return this.final();
  }

};

/**
*  inform last files has started processing
* @method final
*
*/
parseAmiigo.prototype.final = function() {

console.log('Done with last file', this.results);
};

/**
*  call command line for list of logs in file location
* @method commandlineFiles
*
*/
parseAmiigo.prototype.commandlineFiles = function() {

	var localthis = this;
	this.loglist = fs.readdirSync('testdata');
	this.serialflow(this.loglist.shift());

};

/**
*  listen for new log files from Amiigo sensor
* @method manageLogfiles
*
*/
parseAmiigo.prototype.manageLogfiles = function(file, callback) {

	localthis = this;
	//extract time data from filename
	timelogfile = localthis.fileLogDate(file);
	var sensorData = '';
	var readStream = fs.ReadStream("testdata/" + file);
	readStream.setEncoding('ascii'); // This is key; otherwise we'd be using buffers
	// every time "data" is read, this event fires
	readStream.on('data', function(textData) {
		sensorData += textData;
	});

	// the reading is finished...
	readStream.on('close', function () {
		 localthis.elementExtraction(callback, file, timelogfile, sensorData);
	});

};

/**
*  parse out date from file name
* @method fileLogDate
*
*/
parseAmiigo.prototype.fileLogDate = function(fileIN) {

	var timenumber = 0;
	var splitlogRemove = fileIN.slice(0, -6);
	var splitlogend = splitlogRemove.slice(4);
	var splitlogTime = splitlogend.split('-');
	convertDate = new Date(splitlogTime[0], splitlogTime[1]-1, splitlogTime[2], splitlogTime[3], splitlogTime[4], splitlogTime[5]);
	timenumber = Date.parse(convertDate);

	return timenumber;

};

/**
*  serial batch flow utility function
* @method serialBatchflow
*
*/
parseAmiigo.prototype.serialBatchflow = function(callback, filein, logTime, batch) {

  var localthis = this;
	if(batch) {
    this.saveElements(filein, logTime, batch, function(bresult) {
	  	localthis.bresults.push(bresult);
     	return localthis.serialBatchflow(callback, filein, logTime, localthis.blist.shift());
	 });
  }
  else
  {
    return this.bfinal(callback, filein);
  }

};

/**
*  inform last batch has been process notify start of next file start processing
* @method bfinal
*
*/
parseAmiigo.prototype.bfinal = function(callback, filein) {

	setTimeout(function() {
			 callback(filein);
		 }, 10000);

};

/**
*  parse out the data elements
* @method elementExtraction
*
*/
parseAmiigo.prototype.elementExtraction = function(callback, filein, logTime, invalidJSON) {

	var localthis = this;
	var liveLogTime = logTime;
	var liveTimestamp = 1;
	var accumaccelerometercounter = 0;
	var accumaccelerometer = 0;
	var	parse = invalidJSON.split(/\r\n|\n|\r/);
	var i,j,temparray,chunk = 100;
	for (i=0,j=parse.length; i<j; i+=chunk) {
		  temparray = parse.slice(i,i+chunk);
			this.blist.push(temparray);

		}
	// use the batch array to process serially
	this.serialBatchflow(callback, filein, logTime, this.blist.shift());

};

/**
*  save to Influxdb
* @method saveElements
*
*/
parseAmiigo.prototype.saveElements = function(filein, logTime, temparray, bcallback) {

	var counterlines = 0;
	var liveTimestamp = 1;
	var accumaccelerometercounter = 0;
	var accumaccelerometer = 0;

	temparray.forEach(function(singleline) {
		counterlines++;
		if(singleline) {
			var nextstring = singleline;
			var	parsen = nextstring.split('",');
			// different sensors will have different parsing array structures
			if (parsen[0].slice(2)  == "timestamp")
			{
				// reset accum accel counter to zero
				accumaccelerometercounter = 0;

				if(parsen[1]) {

					var removeOne = parsen[1].slice(0, - 1);
					var arrayTimestamp = JSON.parse(removeOne);
					// save to influxdb
					//localthis.livedatabase.saveElementTimestamp(parsen[0].slice(2), arrayTimestamp);
					liveTimestamp = arrayTimestamp[0];
					// keep tabs on last timestamp ie between log files
					localthis.lasttimestamp = liveTimestamp;
				}
			}
			else if(parsen[0].slice(2) == "lightsensor_config")
			{
				// light sensor setting or data?
				var nextstringlight = singleline;
				var nextstringlightr = nextstringlight.slice(22);
				var nextstringlightrr = nextstringlightr.slice(0,-1);
				//var	parsenlight = nextstringlight.split('\'');
				var arraysettings = JSON.parse("[" + nextstringlightrr + "]");
				// save to Influxdb

			}
			else if (parsen[0].slice(2)  == "lightsensor")
			{
				var nextstringlightr = singleline;;

				var	parsenlightr = nextstringlightr.slice(15);
				var	parsenlightrt = parsenlightr.slice(0,-1);
				var arraylight = JSON.parse("[" + parsenlightrt + "]");
				var lightTimestamp = localthis.accTimestamp;
				//update the logfile time count
				localthis.accTimestamp = lightTimestamp + wristSettings.lightfrequency;
				// save to influxdb
				localthis.livedatabase.saveElementLight(parsen[0].slice(2), localthis.baseTimeWrist, logTime, lightTimestamp, arraylight);

			}
			else if (parsen[0].slice(2)  == "log_count")
			{

			}
			else if (parsen[0].slice(2)  == "temperature")
			{
				if(parsen[1]) {
					var temperatureRecorded = parsen[1].slice(0,-1);
					var temperatureTimestamp = localthis.accTimestamp;
					// save to influxdb
					localthis.livedatabase.saveElementTemperature(parsen[0].slice(2), localthis.baseTimeWrist, logTime, temperatureTimestamp, temperatureRecorded);
				}

			}
			else if (parsen[0].slice(2)  == "accelerometer")
			{
				//  accelerometer data
				accumaccelerometercounter = accumaccelerometercounter + (localthis.wristSetAt.accelfrequency * 1000);
				if(liveTimestamp > 0)
				{
					var accumaccelerometer = accumaccelerometercounter + ((liveTimestamp/128)*1000);
					localthis.accTimestamp = accumaccelerometer;
				}
				else
				{
					var accumaccelerometer = localthis.lasttimestamp;
				}
				if(parsen[1]) {
					var removeOne = parsen[1].slice(0, - 1);
					if(removeOne.length > 5)
						{
							var arrayAccelerometer = JSON.parse(removeOne);
							// save to influxdb
							localthis.livedatabase.saveElementAccelerometer(parsen[0].slice(2), localthis.baseTimeWrist, logTime, accumaccelerometer, arrayAccelerometer);

						}
				}
			}
		}
		if(temparray.length == counterlines)
		{
			// slow down processing to keep influxdb happy
			setTimeout(function() {
				bcallback('batchcomplete');
			}, 500);
		}

	});
};

module.exports = parseAmiigo;
