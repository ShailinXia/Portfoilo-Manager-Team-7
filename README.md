# Crazy Friday -- Portfoilo Manager Application

>This is a `Portfoilo Manager Application` developed by `Crazy Friday`. The application is designed to help users manage their portfolios effectively.

## 🌈Team Members

- 🥸`Member 1`: `Allen Zhang`
- 🤯`Member 2`: `Shailin Xia`
- 🥳`Member 3`: `Kelly Suo`
- 😎`Member 4`: `Tom He`
- 🙃`Member 5`: `Alfred Lu`

## 🤪Prerequisites

> - Node.js Reference version: `v20.19.4`
> - npm (Node Package Manager)

```bash
# Installation Instructions

# 1. Convert to the project directory

cd Portfoilo-Manager-Team-7

npm install express cors axios

# 2. And then `cd frontend`

npm install 

npm install axios 

# 3. Finally, `cd ../backend`

npm install express better-sqlite3 xlsx

```

> If your environment version is not the same as the reference version, maybe you need to rebuild the `better-sqlite3` package

## 🚀Usage

```bash
# Set up the terminal authentication in the project root directory

MacOS/Linux:
chmod +x start.sh

Windows: 
Please use git bash to run the script
chmod +x start.sh

MacOS/Linux:
chmod +x stop.sh

Windows: 
Please use git bash to run the script
chmod +x stop.sh

# Start the whole server
./start.sh

# Stop the whole server
./stop.sh
```

## :whale: Docker 

### Install Docker in Mac

```bash
brew install --cask docker

brew install docker-compose
```

> Start Docker Desktop and wait for it to initialize.
> And then conduct the following commands in the terminal.

```bash
docker-compose build

docker-compose up
```
> The run status will be shown in the terminal.
> ![Run successfully](./images/docker_run.png)
> ![Run successfully](./images/docker_log.png)

> Docker pages will be created in the `frontend` and `backend` directories.
> ![Docker pages](./images/docker.png)

> If you build the docker image successfully, you can access the frontend application at `http://localhost:5173` and the backend API at `http://localhost:3000/`.

> ![Frontend Application](./images/frontend_1.png)
> ![Frontend Application](./images/frontend_2.png)