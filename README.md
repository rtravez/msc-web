# MSC Web

Cliente web para la gestión de MSC, construido con Angular 21 y
autenticación con Keycloak.

## Descripción general

Esta aplicación administra recursos de negocio de usuarios,
cuentas y movimientos, con una estructura basada en features y
rutas cargadas de forma diferida. La app usa Keycloak para
autenticación y autorización, y consume servicios backend a
través de proxy local o Nginx en contenedores.

## Tecnologías principales

- Angular 21
- PrimeNG + Bootstrap para interface
- ngx-translate para internacionalización
- Keycloak Angular / Keycloak JS
- Vitest para pruebas unitarias
- ESLint + Prettier para calidad de código

## Requisitos previos

- Node.js 24.x
- npm 11.x
- Backend de autenticación y servicios disponibles en:
  - Auth: [http://localhost:8080](http://localhost:8080)
  - MSC services: [http://localhost:8081](http://localhost:8081)
  - MSA services: [http://localhost:8082](http://localhost:8082)

## Configuración de entorno

El proyecto usa la configuración de entorno en [src/environments/environment.ts](src/environments/environment.ts):

```ts
export const environment = {
  production: false,
  mscServices: '/mscServices',
  msaServices: '/msaServices',
  auth: {
    url: '/authServices',
    realm: 'RTRAVEZ-SSO-INTRANET',
    clientId: 'MSC-WEB',
  },
};
```

Estas rutas se resuelven mediante el proxy definido en [proxy.conf.json](proxy.conf.json):

```json
{
  "/authServices": { "target": "http://localhost:8080" },
  "/mscServices": { "target": "http://localhost:8081" },
  "/msaServices": { "target": "http://localhost:8082" }
}
```

## Instalación

```bash
npm install
```

## Arranque local

```bash
npm start
```

La aplicación queda disponible en:

```text
http://localhost:4200/
```

El comando usa
`ng serve --proxy-config proxy.conf.json --live-reload`
para enrutar las llamadas del frontend hacia los servicios
backend locales.

## Scripts útiles

```bash
npm run build
npm run test
npm run test:watch
npm run test:coverage
npm run lint
npm run format:check
npm run format:write
```

## Flujo de autenticación

La app se inicializa con Keycloak usando configuración del realm
y client id definidos en
[src/environments/environment.ts](src/environments/environment.ts).
El guard de rutas y el interceptor de autenticación controlan:

- acceso protegido a rutas internas
- redirección a login si no hay sesión válida
- renovación del token si expira
- adición automática del `Authorization` header para endpoints protegidos

## Estructura principal

```text
src/
  app/
    core/
      auth/
      i18n/
      models/
      services/
    features/
      accounts/
      dashboard/
      forbidden/
      movements/
      not-found/
      users/
    layout/
  environments/
```

### Features principales

- Users: administración de usuarios
- Accounts: gestión de cuentas
- Movements: registro y consultas de movimientos
- Dashboard: pantalla principal tras iniciar sesión
- Forbidden: acceso denegado por roles
- Not Found: rutas no existentes

## Permisos por rol

La navegación está protegida con guards y validación de roles.
Ejemplo en [src/app/app.routes.ts](src/app/app.routes.ts):

- rutas de `users`, `accounts` y `movements` requieren rol `ADMIN`
- la pantalla `forbidden` se muestra si un usuario no tiene permisos

## Docker

Para desplegar la app en contenedor:

```bash
docker build -f ci/Dockerfile -t msc-web .
docker run --rm --add-host=host.docker.internal:host-gateway -p 4200:4200 msc-web
```

Esto permite que la app acceda a servicios locales del host
usando `host.docker.internal`.

Cuando los servicios no están en el host local, se pueden
sobrescribir los upstreams:

```bash
docker run --rm -p 8080:4200 \
  -e AUTH_SERVICES_UPSTREAM=http://auth-service:8080 \
  -e MSC_SERVICES_UPSTREAM=http://msc-service:8081 \
  -e MSA_SERVICES_UPSTREAM=http://msa-service:8082 \
  msc-web
```

## Buenas prácticas del proyecto

- Mantener componentes y servicios dentro de las feature folders
- Aprovechar rutas lazy-load para cargas diferidas
- Centralizar mensajes de error y estado de carga
- Mantener traducciones en archivos de idioma
- Cubrir flujos de negocio y permisos con pruebas

## Recursos adicionales

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [PrimeNG](https://primeng.org/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [ngx-translate](https://github.com/ngx-translate/core)
