FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build -- --configuration production

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY ci/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/msc-web/browser /usr/share/nginx/html

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
