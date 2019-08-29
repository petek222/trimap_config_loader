# Introduction
NPM node-module package written in node-js with Azure SQL, MySQL, and Oracle Db's that provides database loading funtionality in a high-speed, user-friendly tri-map data storage structure without the need of queries at runtime. Loads all configuration data stored in specified db into a tri-map structure. This loaded config can then be used easily in a series of map lookups. No runtime queries are necessary, so incredibly high speed is maintained after initial load. 

# Files
File(s): mm-common-config.js || DB Table: config_table (provide connectivity information)

# Getting Started
TODO: To bring the package in, use npm install git+GITLINK (the git+ flavor is required for correct installation)
      GITLINK = https://github.com/petek222/config_loader.git
1. Require in another file as 'loader' or any other name. ex. const loader = require('path/src/index.js');
2. Syntax: loader.configLoader(service_name, dbConfig) for any given service_name and db_config parameters (ex. order-service-client and azureDBConfig)
3. Tri-map data structure is returned, sorted as: Map {config_type => Map {config_group => Map {config_item_key => config_item_value}}}
4. Lookups on the map are just double get calls. If the desired data lives in a db without a specified type or group, both are assigned the default param of 'general' when loaded
5. Example of use: 

      var myMap = loader.loadConfig('myServiceName', myDBConfig);

      // Both of these return easily-used, key-value pair maps

      var specificMap = myMap.get('type').get('group');

      var generalMap = myMap.get('general').get('general');
      
# Config Data Map Structure

// config_type => config_group => config_item_name => config_item_value

Each of the fields may be multiple keys/values in the map structure. Note that config_type and config_group need not exist in the database, but config_item_name and config_item_value are necessary fields for the module to function correctly.

# Build and Test
TODO: Mocha/Chai testing frameworks deployed backend, tests housed in config-loader-test.js and config-helper-test.js within order-service-client repo. 

Module trimap_config_loader is currently Mocha - Chai compatible

# Contribute
TODO: Increase readability : See extensive comments for functionality breakdown
      Deploy module in desired areas, continue offloading config data to service_client_config.

