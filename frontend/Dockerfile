# frontend/Dockerfile

# 1. Use Node.js image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the code
COPY . .

# 5. Build the Next.js app for production
RUN npm run build

# 6. Expose the port
EXPOSE 3000

# 7. Start the Next.js server
CMD ["npm", "start"]