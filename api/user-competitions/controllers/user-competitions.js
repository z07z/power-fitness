'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find() {
    	let populateQuery = [{path:"User", select:"id username"}];
	let userCompetitions = await strapi.query('user-competitions').model.find({}).select({
	   id:1,
	   Value:1,
	   isActive:1,
	   User:1
	}).populate(populateQuery).lean();

	return userCompetitions;
    }
};
