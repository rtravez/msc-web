export const environment = {
  production: false,
  mscServices: '/mscServices',
  msaServices: '/msaServices',
  auth: {
    issuer: '/authServices',
    clientId: 'rtravez-web',
    scope: 'openid profile read',
    redirectUri: 'http://localhost:4200/callback',
  },
};
