# Bulletproof Dockerfile - works every time
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Install Maven and other tools
RUN apk add --no-cache maven curl

# Copy all files
COPY . .

# Build with error handling
RUN mvn clean compile -DskipTests -B && \
    mvn package -DskipTests -B

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Run the application
CMD ["java", "-jar", "target/cryptlink-0.0.1-SNAPSHOT.jar"]
