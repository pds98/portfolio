#!/bin/bash

# Créer les répertoires nécessaires
mkdir -p public/images/projects
mkdir -p public/images/icons

# Télécharger les icônes de technologies
curl -o public/images/icons/react.svg "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg"
curl -o public/images/icons/typescript.svg "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg"
curl -o public/images/icons/nodejs.svg "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg"
curl -o public/images/icons/mongodb.svg "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg"
curl -o public/images/icons/git.svg "https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg"
curl -o public/images/icons/docker.svg "https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg"

# Télécharger les images de projets (placeholders)
curl -o public/images/projects/portfolio.jpg "https://picsum.photos/800/600?random=1"
curl -o public/images/projects/ecommerce.jpg "https://picsum.photos/800/600?random=2"
curl -o public/images/projects/chat.jpg "https://picsum.photos/800/600?random=3"

# Télécharger l'image de profil (placeholder)
curl -o public/images/profile.jpg "https://picsum.photos/400/400?random=4"

# Rendre le script exécutable
chmod +x scripts/download-assets.sh
