'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */
module.exports = async () => {
   
  process.nextTick(() =>{
    var io = require('socket.io')(strapi.server);
    
    io.on('connection', async function(socket) {
      
      console.log('Connected!');
      // listen for user diconnect
      socket.on('disconnect', () =>{
        console.log('a user disconnected')
      });

    });

    strapi.io = io;
 
  });
};
