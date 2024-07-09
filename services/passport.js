const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');
const User = mongoose.model('User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new FacebookStrategy(
      {
        clientID: keys.facebookClientID,
        clientSecret: keys.facebookClientSecret,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'photos'],
        scope: ['manage_pages', 'pages_show_list', 'pages_read_engagement']
      },
      (accessToken, refreshToken, profile, done) => {
        User.findOne({ facebookId: profile.id }).then(existingUser => {
          if (existingUser) {
            existingUser.accessToken = accessToken;
            existingUser.save().then(user => done(null, user));
          } else {
            new User({
              facebookId: profile.id,
              name: profile.displayName,
              picture: profile.photos[0].value,
              accessToken
            })
              .save()
              .then(user => done(null, user));
          }
        });
      }
    )
  );
  
