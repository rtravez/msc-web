export const environment = {
  production: true,
  mscServices: '/mscServices',
  msaServices: '/msaServices',
  auth: {
    issuer: '/authServices',
    clientId: 'rtravez-web',
    scope: 'openid profile read',
    // Se resuelve en tiempo de ejecución como `${window.location.origin}/callback`.
    // Así coincide con el dominio público donde se publique la aplicación.
    redirectUri: '',
  },
};
