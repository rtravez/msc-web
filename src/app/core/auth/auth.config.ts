import { environment } from '../../../environments/environment';

const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';

export const authConfig = {
  issuer: environment.auth.issuer,
  clientId: environment.auth.clientId,
  scope: environment.auth.scope,
  redirectUri: environment.auth.redirectUri || `${currentOrigin}/callback`,
};

export const authorizationEndpoint = `${authConfig.issuer}/oauth2/authorize`;
export const tokenEndpoint = `${authConfig.issuer}/oauth2/token`;