export const prod = {
  mongoURI: process.env.MONGO_URI,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  facebookAppID: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
  gmailPW: process.env.GMAILPW,
  cookieSecret: process.env.COOKIE_SECRET,
  facebookCallBackURI:
    "https://getup-and-play.herokuapp.com/auth/facebook/callback",
  s3SecretAccessKey: process.env.S3SECRETACCCESSKEY,
  s3AccessKeyId: process.env.S3ACCESSKEY
};
