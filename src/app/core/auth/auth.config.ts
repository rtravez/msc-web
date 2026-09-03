export const authConfig = {
  issuer: 'http://localhost:8080/authServices',
  clientId: 'rtravez-web',
  scope: 'openid profile read',
  redirectUri: `${typeof window === 'undefined' ? 'http://localhost:4200' : window.location.origin}/callback`,
};

export const authorizationEndpoint = `${authConfig.issuer}/oauth2/authorize`;
export const tokenEndpoint = `${authConfig.issuer}/oauth2/token`;