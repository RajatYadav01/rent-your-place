# Stage 1: Use the official Node.js LTS image
FROM node:23.11.0-alpine3.21 AS build

# Set working directory
WORKDIR /app/rent-your-place-frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY .env* ./
COPY src ./src
COPY public ./public
COPY tsconfig.json ./

# Build the app for production
RUN npm run build

# Stage 2: Serve the app using a web server like Nginx
FROM nginx:alpine

# Copy the build output to Nginx's public folder
COPY --from=build /app/rent-your-place-frontend/build /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]