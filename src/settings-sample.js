/**
*  Gaiablock - wearable parser
*
* Settings for influxdb

* @class settings
*
* @package   Gaiablock open source project
* @copyright  Copyright (c) 2012 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* @version    $Id$
*/
var settings = function() {

  this.account = {};
	this.account.influxdb = {};
	this.account.influxdb.host = 'localhost';
	this.account.influxdb.username = 'username';
	this.account.influxdb.password = 'password';
	this.account.influxdb.database = 'new-database';
};

module.exports = settings;
