export const environment = {
  production: false,
  apiBaseUrl: '/mscServices',
  auth: {
    issuer: '/authServices',
    clientId: 'rtravez-web',
    scope: 'openid profile read',
    redirectUri: 'http://localhost:4200/callback',
  },
};
