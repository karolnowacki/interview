FROM node:18-bullseye

RUN apt update && apt install maven openjdk-17-jdk-headless -y
RUN java -version

WORKDIR /app

COPY . ./

WORKDIR /app/frontend
RUN npm install --omit-dev
RUN npm run build

WORKDIR /app
RUN npm install

#maven build for speed up
WORKDIR /app/compilers/java
RUN mvn clean surefire-report:report

WORKDIR /app

EXPOSE 5000

CMD ["node", "index.js"]

