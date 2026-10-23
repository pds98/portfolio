# =============================================================================
#  Frontend React + Vite – Dockerfile multi-étapes
#   - cible « dev »  : serveur Vite avec rechargement à chaud (docker-compose)
#   - cible « prod » : fichiers statiques compilés servis par nginx
# =============================================================================

FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM dev AS build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
# Application monopage : toute URL inconnue renvoie index.html (React Router)
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
