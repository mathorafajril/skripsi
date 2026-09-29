# backend/Dockerfile

FROM node:20-alpine

# Create working directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the backend source
COPY . .

# Expose the backend port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]