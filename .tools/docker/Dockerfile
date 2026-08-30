# Wieloetapowe budowanie: Node kompiluje bundle Vite, nginx serwuje statyki.
FROM node:20-alpine AS build

WORKDIR /app

# Zaleznosci instalowane przed skopiowaniem zrodel, zeby warstwa npm
# byla cache'owana dopoki nie zmieni sie package.json.
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
