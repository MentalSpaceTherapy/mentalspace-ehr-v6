FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Command to run migrations (will be overridden by docker-compose command)
CMD ["npm", "run", "typeorm:run"] 