# Introduction
NPM node-module package written in node-js with Azure SQL, MySQL, and Oracle Db's that provides database loading funtionality in a high-speed, user-friendly tri-map data storage structure without the need of queries at runtime. Loads all configuration data stored in specified db into a tri-map structure. This loaded config can then be used easily in a series of map lookups. No runtime queries are necessary, so incredibly high speed is maintained after initial load. 

Example of production use is currently within config-helper.js in order-service-client at MTD Products and within MTD_Order_Lookup application to load and manipulate specific db config data.

# Files
File(s): mm-common-config.js || DB Table: db_config.json (provide connectivity information)

# Getting Started
TODO: To bring the package in, use npm install trimap_config_loader

1. Require in another file as 'loader' or any other name. ex. const loader = require('path/trimap-config-loader/trimap-config-loader');
2. Syntax: loader.configLoader(service_name, dbConfig) for any given service_name and db_config parameters (ex. order-service-client and azureDBConfig)
3. Tri-map data structure is returned, sorted as: Map {config_type => Map {config_group => Map {config_item_key => config_item_value}}}
4. Lookups on the map are just double get calls. If the desired data lives in a db without a specified type or group, both are assigned the default param of 'general' when loaded
5. Example of use: 

      `var myMap = loader.loadConfig('myServiceName', myDBConfig);`

      `// Both of these return easily-used, key-value pair maps`

      `var specificMap = myMap.get('type').get('group');`

      `var generalMap = myMap.get('general').get('general');`
      
# Config Data Map Structure

`config_type => config_group => config_item_name => config_item_value`

Each of the fields may be multiple keys/values in the map structure. Note that config_type and config_group need not exist in the database, but config_item_name and config_item_value are necessary fields for the module to function correctly.

# Build and Test
TODO: Mocha/Chai testing frameworks deployed backend, tests housed within seperate order-service-client repo. 

Module trimap-config-loader is currently Mocha - Chai compatible

# Contribute
TODO: 
1. Increase flexibility in terms of service names/columns, and ensure that the module is MySQL compatible
2. Fix require issues (ie. update so path to module itself is not a required specification)

