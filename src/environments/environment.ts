export const environment = {
  production: false,
  mscServices: '/mscServices',
  msaServices: '/msaServices',
  auth: {
    issuer: '/authServices',
    clientId: 'rtravez-web',
    scope: 'openid profile offline_access read',
    redirectUri: 'http://localhost:4200/callback',
  },
};
