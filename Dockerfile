# Multi-stage build for smaller image
FROM maven:3.9-openjdk-17-slim AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime image
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy only the jar file
COPY --from=builder /app/target/cryptlink-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
