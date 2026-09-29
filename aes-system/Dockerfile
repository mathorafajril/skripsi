# Dockerfile.frontend

FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build argument for API URL
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Build the React app with the env variable baked in
RUN npm run build

# Install serve to host the built app
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]