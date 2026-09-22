# Build in due passaggi: Maven scarica le dipendenze e compila, poi l'immagine
# finale porta solo il jar e una JRE, senza tutta la toolchain di build.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render assegna la porta con $PORT: Spring Boot la legge da server.port.
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
