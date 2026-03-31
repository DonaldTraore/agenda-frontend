# --- ÉTAPE 1 : CONSTRUCTION (Nommée "builder") ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build --configuration=production

# --- ÉTAPE 2 : PRODUCTION (Serveur Nginx léger) ---
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# CHANGEMENT 1 : Copier comme .template (pas directement dans conf.d)
COPY agenda.conf /etc/nginx/templates/agenda.conf.template

COPY --from=builder /usr/src/app/dist/frontend/browser/ /usr/share/nginx/html/
RUN echo '<html><head><title>Error</title></head><body><h1>Error</h1><p>Sorry, something went wrong.</p></body></html>' > /usr/share/nginx/html/50x.html
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# CHANGEMENT 2 : envsubst substitue BACKEND_URL avant de lancer Nginx
# CHANGEMENT 3 : les guillemets simples protègent les variables Nginx ($uri, $host...)
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/templates/agenda.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
