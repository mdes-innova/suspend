# frontend/Dockerfile
FROM node:20

WORKDIR /app

# Install dependencies (initially empty, but updated later)
COPY package*.json ./

RUN npm install || true  # fallback if no package.json yet

EXPOSE 3000

CMD ["npm", "run", "dev"]
