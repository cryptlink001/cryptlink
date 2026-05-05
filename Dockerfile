# Use Java 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install Maven and other dependencies
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy pom.xml first (for better layer caching)
COPY pom.xml .

# Download dependencies (with timeout and retry)
RUN mvn dependency:go-offline -B --timeout 300 || \
    mvn dependency:resolve -B --timeout 300

# Copy source code
COPY src ./src

# Build the application (with skip tests and error handling)
RUN mvn clean package -DskipTests -B --quiet || \
    (mvn clean compile -B --quiet && mvn package -DskipTests -B --quiet)

# Expose port
EXPOSE 8080

# Run the application with proper JVM options
CMD ["java", "-Xmx512m", "-Xms256m", "-jar", "target/cryptlink-0.0.1-SNAPSHOT.jar"]
