# node-pubsub 

  A port of bloody-jquery-plugins pubsub functionality. https://github.com/phiggins42/bloody-jquery-plugins

  This is simple pubsub feature to be used in node.

    var hub = require('node-pubsub');

    hub.subscribe('/mychannel', function( message ){
      console.log(message);
    });
    hub.publish('/mychannel', [ { message: 'my message' } ], this);
    
    hub.unsubscribe(['/mychannel']);

## Installation
  
    $ npm install node-pubsub
  
or to install the node-pubsub package globally:

    $ npm install node-pubsub -g

## Quick Start

  The fastest way to get started is to
  
    Install the library:
    
      $npm install node-pubsub
  
    Open up app.js and add:
  
      var hub = require('node-pubsub');
  
      hub.subscribe('/mychannel', function( message ){
        console.log(message);
      });
      hub.publish('/mychannel', [ { message: 'my message' } ], this);
      
      hub.unsubscribe(['/mychannel']);
      
  

## Features
  * Ambiguous communication plugin. 
  * Small API surface. 
  * Publishing of events to a channel
  * Subscribing to events from a channel
  * Unsubscribing from a channel

## TODO
  * Fix require so that it doesn't land as an instance. 
    var hub = require('node-pubsub'); 
  should be 
    var hub = require('node-pubsub').create();

# License

  Being stolen directly from the Dojo Toolkit source/bloody-jquery-plugins, this code is released under a dual AFL/BSD license identical to Dojo proper. See http://dojotoolkit.org/license for more information.