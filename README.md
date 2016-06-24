# wearableparser
parser for log files from an amiigo open source wearable data

a node.js parser of log files saved to influxdb.

Stages
======

1. Use amiigo linux bluetooth driver to extract data from an www.amiigo.com wearable

2. Extract files

3. Create a settings file from the sample-settings.js file for influxdb settings

4. Install influxdb

5. Run  node index.js  to start parsing and saving of data
