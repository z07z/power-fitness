'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

	async findMyActivity(ctx){
	  
          const { communityID, userID } = ctx.request.body;
          let activities = await strapi.query('activity').find({'community.id':communityID, 'users.id':userID});
	  
	  return activities;
	}
};
