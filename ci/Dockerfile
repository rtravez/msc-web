FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build -- --configuration production

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

# Los valores pueden sobrescribirse al ejecutar el contenedor o desde Compose/Kubernetes.
ENV AUTH_SERVICES_UPSTREAM=http://host.docker.internal:8080
ENV MSC_SERVICES_UPSTREAM=http://host.docker.internal:8081
ENV MSA_SERVICES_UPSTREAM=http://host.docker.internal:8082

COPY ci/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/msc-web/browser /usr/share/nginx/html

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
