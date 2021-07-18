'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.community.search(ctx.query);
    } else {
      entities = await strapi.services.community.find(ctx.query);
    }

    return entities.map((entity, index) => {
      const community = sanitizeEntity(entity, {
        model: strapi.models.community,
      });
    
     /* if (community.users) {
	delete community.users[index].phone;
	delete community.users[index].provider;
	delete community.users[index].verification_sid;
	delete community.users[index].role;
	delete community.users[index].code;
	delete community.users[index].confirmed;
	delete community.users[index].blocked;
	delete community.users[index].user_activities;
	delete community.users[index].user_classes;
	delete community.users[index].user_clubs;
	delete community.users[index].user_communities;
	delete community.users[index]._id;
	delete community.users[index].createdAt;
	delete community.users[index].updatedAt;
	delete community.users[index].__v;
      } */

      return community;
     });

  },
  
  async findOne(ctx){
      //let community = await strapi.query('community').findOne({ id: ctx.params.id },['users','photo', 'clubs','competitions']);
      let communityUsers, communityPhoto, communityClubs, communityCompetitions, communityActivities;
      let populateQuery = [{path:'users', select:'id username'}, {path:'competitions', select:'id'},{path:'clubs', select:'id'}]; 
      
      let community = await strapi.query('community').model.findOne({_id: ctx.params.id}).select({
        name: 1,
	id: 1,
        users: 1,
	photo: 1,
	clubs: 1,
	competitions: 1,
	activities: 1
      }).populate(populateQuery).lean();	
      
      if(community.users){
      	communityUsers = community.users.length;
        delete community.users
      }

      if(community.photo){
        communityPhoto = `${strapi.config.get('server.url')}${community.photo.formats.small.url}`;
        delete community.photo
      }

      if(community.clubs){
        communityClubs = community.clubs.length;
        delete community.clubs
      }

      if(community.competitions){
        communityCompetitions = community.competitions.length;
        delete community.competitions
      }	  

      if(community.activities){
      	communityActivities = community.activities.length;
	delete community.activities;
      }
     
      community['communityUsers'] = communityUsers;
      community['communityPhoto'] = communityPhoto;
      community['communityClubs'] = communityClubs;
      community['communityCompetitions'] = communityCompetitions;
      community['communityActivities'] = communityActivities;

      return community;
  },

  /*async findByUserId(ctx) {
      const {id} = ctx.params; 
      let communities = await strapi.query('community').find({'users.id':id},['users']);
     
      return communities.map((community, index) => {
      
	const communityModel = sanitizeEntity(community, {
            model: strapi.models.community,
        });

	if(communityModel.users){
	   delete communityModel.users
	}

        return communityModel	

      });
  },*/

  async findByCode(ctx){
       const {communityCode} = ctx.params;
       let community = await strapi.query('community').findOne({ communityCode }, ['']);
       if(community){
       	 return {name: community.name, photo: `${strapi.config.get('server.url')}${community.photo.formats.thumbnail.url}`};
       }

       return 'no result';
  },

  async communityUsers(ctx){
	  
      let populateQuery = [{path:'users', select:'id username -user_communities'}]; 
      
      let users = await strapi.query('community').model.findOne({_id: ctx.params.id}).select({
        users: 1,
	photo: 0
      }).populate(populateQuery).lean();
      
      if(users){
      	delete users.user_communities;
      }	 

      return users;
  },
};

