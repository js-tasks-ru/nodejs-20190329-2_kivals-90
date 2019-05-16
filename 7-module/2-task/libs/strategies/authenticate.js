const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  try {
    if (!email) {
      return done(null, false, 'Не указан email');
    }
    const dbUser = await User.findOne({email});
    if (!dbUser) {
      const dbUser = new User({email, displayName});
      await dbUser.save();
      return done(null, dbUser);
    }

    return done(null, dbUser);
  } catch (err) {
    done(err);
  }

};
