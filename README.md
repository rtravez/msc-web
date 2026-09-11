# MSC Web

Web client for MSC Management, built with Angular 21.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test -- --watch=false
```

## Running with Docker

Build the production image and start the container. The `host.docker.internal` mapping allows
the container to reach the three services running on the Docker host:

```bash
docker build -f ci/Dockerfile -t msc-web .
docker run --rm --add-host=host.docker.internal:host-gateway -p 8080:4200 msc-web
```

Open `http://localhost:8080/` in your browser. Angular routes and the `/authServices`,
`/mscServices`, and `/msaServices` API prefixes are handled by Nginx.

When the services run in another Docker network or environment, override their destinations:

```bash
docker run --rm -p 8080:4200 \
  -e AUTH_SERVICES_UPSTREAM=http://auth-service:8080 \
  -e MSC_SERVICES_UPSTREAM=http://msc-service:8081 \
  -e MSA_SERVICES_UPSTREAM=http://msa-service:8082 \
  msc-web
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
