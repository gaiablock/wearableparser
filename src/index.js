/**
*  Dsensor - Sensor Library TEST
*
* TEST SensorLibrary independently

*
* @package    Dsensor.org open source project
* @copyright  Copyright (c) 2012 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* @version    $Id$
*/

var sensorController = require("./sensorcontroller.js");
var settings = require("./settings.js");
//console.log(sensorController);
var database = new settings();

liveSensorController = new sensorController(database);

console.log('parser started');
