"use strict";

const sql = require('mssql');

// Please see the documentation for complete information
//
// Note: db-config and service_name must be provided independently
// Module contains the functionality for loading a db config into a tri-map structure
// If the data is just stored in key-value pairs with a specified service name, any data present as basic
// key-value pairs is given dual 'general' params for its type and group params as a default.
//
// Thus they can still be treated as a map of key value pairs: one extra double.get call of .get('general').get('general)
// is required to access the straight map of non-config group / config-type values.
//
// Despite significant load-time, the amount of time saved once config is in memory for not having
// to make constant runtime database queries is immense.
//
// Global accessibility does NOT extend to mocha/chai unit tests due to framework incompatibility
// Brings entire config db into app: sorts into tri-map structure via 'in-reverse logic'. 
// Getting/Accessing config data is left to the application using the module once config is in memory
exports.configLoader = function(service_name, db_config) {
    
    return new Promise((resolve, reject) => {

        try {

            var dbConnection = new sql.ConnectionPool(db_config);
            dbConnection.connect()
                .then( function () {

                    var req = new sql.Request(dbConnection);

                    // You can modify these queries to grab your specific tables column names if need be 
                    req.input('service_name', sql.VarChar, service_name);
                    req.query("select service_name, config_item_name, config_item_value, config_type, config_group from service_client_config where service_name = @service_name order by config_type, config_group", (err, result) => {

                        // variables for readability
                        var myResult = result.recordset;
                        var length = myResult.length;

                        if (err) {
                            console.log(err);
                            reject(err);
                        }

                        // Primary map in tri-map config data structure: maps general config_type to substructure  
                        var configTypeMap = new Map();
                                            
                        // outer for loop stores config_type keys
                        for (var i = 0; i < length; i++) {

                            // one step down if starting / entering a new config_type batch
                            if (i == 0 || myResult[i].config_type != myResult[i-1].config_type) {

                                // Secondary map in tri-map structure: maps a config_group key to specific data map for use
                                var configGroupMap = new Map(); 

                                var typeCount = configCountTypeHelper(configTypeMap, configGroupMap, myResult, myResult[i].config_type);

                                // secondary loop stores config_group keys
                                for (var j = i; j < i + typeCount && j+1 <= length; j++) { 

                                    // another step down if starting / entering a new config_group batch
                                    if (j == 0 || myResult[j].config_group != myResult[j-1].config_group) {

                                        // Lowest-level map in tri-map structure: stores key-value pairs for actual config data: what will be returned in a lookup
                                        var configItemsMap = new Map(); 

                                        var groupCount = configCountGroupHelper(configGroupMap, configItemsMap, myResult, myResult[j].config_group);

                                        // ternary loop sets config_item_name : config_item_value pairs in submaps as needed 
                                        for (var k = j; k < j + groupCount ; k++) { 
                                            configItemsMap.set(myResult[k].config_item_name, myResult[k].config_item_value);

                                            if (k+1 == length || myResult[k].config_group != myResult[k+1].config_group) {
                                                break; // break allows for entry-creation to switch upon changing of config_group
                                            }
                                        }
                                        // Sets secondary configGroup map to lowest-level data map
                                        configGroupMap.set(myResult[j].config_group, configItemsMap);
                                }
                            }
                            // Finally sets primary configType map to the configGroup map from above
                            configTypeMap.set(myResult[i].config_type, configGroupMap);
                            }
                        }

                        resolve(configTypeMap);
                    })
                })
                .catch (err => {
                    console.log(err);
                    reject(err);                
                }) 
        }
        catch (exception) {
            console.log(exception);
            reject(exception);
        }
    })
}

// Helper function to count config types
function configCountTypeHelper (configTypeMap, configGroupMap, myResult, configType) {

    let count = 0;

    for (var i = 0; i < myResult.length; i++) {

        // 'if' blocks set the config_type and config_group to 'general' from null as needed 
        if (myResult[i].config_type == null) {
            configType = 'general';
            myResult[i].config_type = 'general';
            configTypeMap.set('general', configGroupMap);
        }    

        if (myResult[i].config_group == null) {
            myResult[i].config_group = 'general';
        }

        if (myResult[i].config_type == configType) {
            count++;
        }
    }

    return count;
}

// helper function to count config groups
function configCountGroupHelper (configGroupMap, configItemsMap, myResult, configGroup) {

    let count = 0;

    for (var i = 0; i < myResult.length; i++) {

        if (myResult[i].config_group == null) {
            configGroup = 'general'
            configGroupMap.set('general', configItemsMap);
        }

        if (myResult[i].config_group == configGroup) {
            count++;
        }
    }
    return count;
}