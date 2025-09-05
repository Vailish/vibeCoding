FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p /uploads

EXPOSE 8000

CMD ["npm", "run", "dev"]