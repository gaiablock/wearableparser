/**
*  Gaiablock - Calls to InfluxDB  times series database
*
* Manages saving of data to Influxdb

* @class influxDB
*
* @package    gaiablock.org open source project
* @copyright  Copyright (c) 2012 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* @version    $Id$
*/
var influx = require('influx');

var influxDB = function(settingsIn) {
console.log('influx class');
	this.settings = settingsIn;
	this.liveclient = {};
	this.settingsInfluxdb();
	this.newInfluxdb();
	//this.deleteInfluxdb();
	//this.influxdbDatabases();
	//this.influxMeasurements();
	//this.queryTimeseriesName();
  //this.queryTimeseriesAccelerometer();
  //this.queryTimeseriesTemperature();
	//this.queryTimeseriesLight();

};

/**
*  default influxdb settings
* @method settingInfluxdb
*
*/
influxDB.prototype.settingsInfluxdb = function() {
console.log('setting of influx start');
	this.liveclient = influx({host: this.settings.host, username: this.settings.username, password: this.settings.password, database: this.settings.database});

};

/**
*  create a new influxDB
* @method newInfluxdb
*
*/
influxDB.prototype.newInfluxdb = function() {

	this.liveclient.createDatabase(this.settings.database, function(err, result) {

	} );

};

/**
*  delete an  influxDB database
* @method deleteInfluxdb
*
*/
influxDB.prototype.deleteInfluxdb = function() {

	this.liveclient.dropDatabase (this.settings.database, function(err,response) {
console.log('drop a db influx');
console.log(err);
console.log(response);

	});


};

/**
*  check  influx db name
* @method influxdbDatabases
*
*/
influxDB.prototype.influxdbDatabases = function() {

	this.liveclient.getDatabaseNames( function(err,arrayDatabaseNames){
//console.log('list of databases influx');
//console.log(arrayDatabaseNames);

	});

};

/**
*  list of active measurement series
* @method influxMeasurements
*
*/
influxDB.prototype.influxMeasurements = function() {

	this.liveclient.getMeasurements(function(err,arrayMeasurements){
//console.log('measurements list');
//console.log(arrayMeasurements);
//console.log(arrayMeasurements[0].series);
//console.log(arrayMeasurements[0].series[0].values);

	});

};


/**
*  save amiigo accelerometer element to influx
* @method saveElementAccelerometer
*
*/
influxDB.prototype.saveElementAccelerometer = function(series, basetime, logfiletime, timestampacc, dataarray) {

	var timestampaccfileround = Math.round(timestampacc);
	var actualtime = Math.round((basetime + timestampacc));

	this.liveclient.writePoint(series, {time: actualtime, xaxis: dataarray[0], yaxis: dataarray[1], zaxis: dataarray[2], logfiledate: logfiletime, timestamp: timestampaccfileround}, { brand: 'amiigowrist', sensor : 'accelerometer'}, {precision : 'ms'}, function(err, response) {
//console.log('save accellerometer write');
//console.log(err);
//console.log(response);

	});

};

/**
*  save amiigo Temperature element to influx
* @method saveElementTemperature
*
*/
influxDB.prototype.saveElementTemperature = function(series, basetime, logfiletime, timestamptemp, datatemp) {

	var timestampaccfileround = Math.round(timestamptemp);
	var actualtime = Math.round((basetime + timestamptemp));

	this.liveclient.writePoint(series, {time: actualtime, temperature: datatemp, logfiledate: logfiletime, timestamp: timestampaccfileround}, { brand: 'amiigowrist', sensor : 'temperature'}, {precision : 'ms'}, function(err, response) {
//console.log('save temperature write');
//console.log(err);
//console.log(response);

	});

};

/**
*  save amiigo Light element to influx
* @method saveElementLight
*
*/
influxDB.prototype.saveElementLight = function(series, basetime, logfiletime, timestamplight, datalight) {

	var timestampaccfileround = Math.round(timestamplight);
	var actualtime = Math.round((basetime + timestamplight));

	this.liveclient.writePoint(series, {time: actualtime, red: datalight[0][1], ir: datalight[1][1], logfiledate: logfiletime, timestamp: timestampaccfileround}, { brand: 'amiigowrist', sensor : 'lightsensor'}, {precision : 'ms'}, function(err, response) {
//console.log('save light write');
//console.log(err);
//console.log(response);

	});

};

/**
*  query influx for a time series name
* @method queryTimeseriesAccelerometer
*
*/
influxDB.prototype.queryTimeseriesAccelerometer = function(callbackIN) {


	//var query = 'SELECT xaxis, yaxis, zaxis, logfiledate, timestamp FROM accelerometer'; //WHERE time > \'2015-08-14 14:23:01.000\' AND time < \'2015-08-14 14:25:59.000\';';
  var query = 'SELECT * FROM accelerometer';
  this.liveclient.queryRaw([this.settings.database], query, function(err, results) {
console.log('query accelerometer');
console.log(err);
console.log(results);
console.log(results[0].series[0]);
		//callbackIN(results[0].series[0]);

	});

};

/**
*  query influx for a time series Temperature
* @method queryTimeseriesTemperature
*
*/
influxDB.prototype.queryTimeseriesTemperature = function(callbackIN) {
console.log('start temp query');

	var query = 'SELECT * FROM temperature;';
	this.liveclient.queryRaw([this.settings.database], query, function(err, results) {
console.log('query raw temperature');
//console.log(err);
console.log(results);
console.log(results[0].series[0]);
	});

};


/**
*  query influx for a time series Light  Red and IR
* @method queryTimeseriesLight
*
*/
influxDB.prototype.queryTimeseriesLight = function(seriesname) {
console.log('start light query');

	var query = 'SELECT * FROM lightsensor;';
	this.liveclient.queryRaw([this.settings.database], query, function(err, results) {
console.log('query raw light');
//console.log(err);
console.log(results);
console.log(results[0].series[0]);


	});

};

module.exports = influxDB;
