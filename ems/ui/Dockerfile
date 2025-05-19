# Use official Node.js image as the base
FROM node:18
# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application files
COPY . .
# Build the React app
RUN npm run build
# Install `serve` to serve the static files
RUN npm install -g serve
# Expose port 2800
EXPOSE 2800
# Start the app using `serve`
CMD ["serve", "-s", "build", "-l", "2800"]
