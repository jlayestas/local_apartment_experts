# ── Stage 1: build the fat JAR ────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom first so dependency download is cached independently from source
COPY pom.xml ./
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: minimal runtime image ────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
