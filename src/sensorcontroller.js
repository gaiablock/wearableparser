/**
*  Dsensor - Controller for SensorLibrary
*
* Manages cellection of sensor data and making them a data asset

* @class sensorController
*
* @package    Dsensor.org open source project
* @copyright  Copyright (c) 2012 James Littlejohn
* @license       http://www.gnu.org/licenses/gpl.html
* @version    $Id$
*/
var util = require('util');
var events = require("events");
var fs = require('fs');
var parserAmiigo = require('./parseramiigo.js');


var sensorController = function(settingsDatabase) {

	StartParser = new parserAmiigo(settingsDatabase);

};

module.exports = sensorController;
