# --- ÉTAPE 1 : CONSTRUCTION (Nommée "builder") ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Installer pnpm globalement
RUN npm install -g pnpm

# Copier les fichiers de dépendances
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le reste du code source
COPY . .

# Construire l'application Angular
RUN pnpm run build --configuration=production

# --- ÉTAPE 2 : PRODUCTION (Serveur Nginx léger) ---
FROM nginx:alpine

# Supprimer la configuration par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# ✅ CORRECTION : Vérifier que le fichier agenda.conf existe
COPY agenda.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis l'étape builder
# ✅ VÉRIFIE le chemin de build Angular - c'est souvent la source du problème
COPY --from=builder /usr/src/app/dist/frontend/browser/ /usr/share/nginx/html/

# ✅ AJOUTER la création du fichier 50x.html (manquant)
RUN echo '<html><head><title>Error</title></head><body><h1>Error</h1><p>Sorry, something went wrong.</p></body></html>' > /usr/share/nginx/html/50x.html

# S'assurer que les fichiers sont accessibles
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Vérifier que la config nginx est valide
# RUN nginx -t

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]