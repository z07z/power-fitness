const twilio = {
  id: process.env.TWILIO_ACCOUNT_ID,
  token:process.env.TWILIO_ACCOUNT_TOKEN,
  phone:process.env.TWILIO_PHONE_NO,
  SERVICE_ID:process.env.TWILIO_SERVICE_ID
}

const smsClient = require('twilio')(twilio.id, twilio.token);

module.exports = {

async userCommunities(ctx) {

    let populateQuery = [{path:'user_communities', select:'id name description photo'}]; 
    let userCommunities = await strapi.query('user', 'users-permissions').model.findOne({_id : ctx.params.id}).select({
	user_communities: 1
    }).populate(populateQuery).lean();

    return userCommunities;
},

async create(ctx) {

    const { phone, username } = ctx.request.body;

    if (!phone) return ctx.badRequest('missing.phone');
    if (!username) return ctx.badRequest('missing.username');

    const userWithThisNumber = await strapi
      .query('user', 'users-permissions')
      .findOne({ phone });

    if (userWithThisNumber) {
      return ctx.badRequest(
        null,
        {
          id: 'Auth.form.error.phone.taken',
          message: 'Phone already taken.',
          field: ['phone'],
        }
      );
    } 
    
    const user = {
      username,
      phone,
      provider: 'local',
      verification_sid: '',
    };

    const advanced = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    const defaultRole = await strapi
      .query('role', 'users-permissions')
      .findOne({ type: advanced.default_role }, []);

    user.role = defaultRole.id;

    try {     
      
      await smsClient.verify.services(twilio.SERVICE_ID)
             .verifications
             .create({
		     to: phone,
		     channel: 'sms',
		     customFriendlyName: 'Power'
	     })
             .then(verification => {
		     console.log(verification.status);
		     user.verification_sid = verification.sid;
	     });
    
    const data = await strapi.plugins['users-permissions'].services.user.add(user);
      
    ctx.created(data);

    } catch (error) {
      ctx.badRequest(null, { error });
    }
  },

async verifyAccount(ctx) {

    const { id, phone, code } = ctx.request.body;
    
    if (!phone) return ctx.badRequest('missing.phone');
    if (!code) return ctx.badRequest('missing.code');

    const verifyUserCode = await strapi
      .query('user', 'users-permissions')
      .findOne({ phone });

   
    if (!verifyUserCode) {
      return ctx.badRequest(
        null,
        {
          id: 'Auth.form.error.code.invalid',
          message: 'Invalid Code or Number',
          field: ['phone'],
        }
      );
    }

    await smsClient.verify.services(twilio.SERVICE_ID)
      .verificationChecks
      .create({to: phone, code: code})
      .then(verification_check => {
	     console.log(verification_check.status);
	     if(verification_check.status !== 'approved')
	     	return ctx.badRequest('Not approved');
      });

    updateData = {
          verification_sid: '',
          confirmed: true,
          code: ''
    }; 

    const data = await strapi.plugins['users-permissions'].services.user.edit({ id }, updateData);
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: data.id,
    })
    ctx.send({ jwt, user: data });  
      
  }
}
