// below is also working with post auth lambda trigger
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_wm6fGD693',
      userPoolClientId: '5du8vcg3gj0o53pu85vtb3pir7',
      loginWith: {
        oauth: {
          domain: 'us-east-1wm6fgd693.auth.us-east-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          // redirectSignIn: [ `http://localhost:3000/onboarding-upload-only`],
          redirectSignIn: [ `https://hr-houdini-frontend-69pu.vercel.app/onboarding-upload-only`],
          // redirectSignOut: ['http://localhost:3000'],
          redirectSignOut: ['https://hr-houdini-frontend-69pu.vercel.app/'],
          responseType: 'token',
          providers: ['Google']
        }
      }
    }
  }
};

export default amplifyConfig;