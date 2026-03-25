const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("GOOGLE PROFILE:", profile); // ✅ DEBUG

      try {
        const { id, displayName, emails, photos } = profile;

        // ✅ Safe email extraction
        const email = emails && emails.length > 0 ? emails[0].value : null;

        if (!email) {
          return done(new Error("No email found from Google"), null);
        }

        // ✅ Check existing Google user
        let user = await User.findOne({ googleId: id });
        if (user) return done(null, user);

        // ✅ Check existing email user
        user = await User.findOne({ email });

        if (user) {
          user.googleId = id;
          user.isSocialLogin = true;
          await user.save();
          return done(null, user);
        }

        // ✅ Create new user
        user = await User.create({
          name: displayName || "Google User",
          email,
          googleId: id,
          avatar: photos?.[0]?.value || "",
          isSocialLogin: true,
          password: null,
        });

        return done(null, user);

      } catch (err) {
        console.error("PASSPORT ERROR:", err); // ✅ IMPORTANT
        return done(err, null);
      }
    }
  )
);

module.exports = passport;