# Multi-stage build: Node compiles the Vite bundle, nginx serves the static files.
FROM node:20-alpine AS build

WORKDIR /app

# Dependencies are installed before the sources are copied, so the npm layer
# stays cached until package.json changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY .tools/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
