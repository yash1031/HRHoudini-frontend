// below is also working with post auth lambda trigger
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: `${process.env.NEXT_PUBLIC_USER_POOL_ID}`,
      userPoolClientId: `${process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID}`,
      loginWith: {
        oauth: {
          domain: `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}`,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [ `${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_SIGNIN_URI}`],
          redirectSignOut: [ `${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_SIGNOUT_URI}`],
          responseType: 'code',
          providers: ['Google']
        }
      }
    }
  }
};

export default amplifyConfig;