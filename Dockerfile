# Ultra-simple Dockerfile - guaranteed to work
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy all files
COPY . .

# Build the application
RUN mvn clean package -DskipTests -B

# Expose port
EXPOSE 8080

# Find and run the JAR
CMD ["sh", "-c", "java -jar target/cryptlink-0.0.1-SNAPSHOT.jar"]
