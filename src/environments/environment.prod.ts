export const environment = {
  production: true,
  mscServices: '/mscServices',
  msaServices: '/msaServices',
  auth: {
    issuer: '/authServices',
    clientId: 'MSC-WEB',
    scope: 'openid profile offline_access read',
    redirectUri: '',
  },
};
