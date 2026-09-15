import { createAuthGuard } from 'keycloak-angular';

export const authGuard = createAuthGuard(async (_route, _state, { authenticated }) => {
  return authenticated;
});
