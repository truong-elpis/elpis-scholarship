# Elpis Battle Scholarship

![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)

This repo provide a script to Elpis Battle's scholarship feature.

## Getting Started
### Installation
Requires [Node.js](https://nodejs.org/) v14+ to run.

Install the dependencies and devDependencies and start the script.

```sh
npm i -g yarn
npm i -g typescript
yarn
```
### Set up the Environment
You need to set up your development environment before you can do anything.

#### .env
```sh
cp .env.example .env
```
```dosini
FILE_INPUT_PATH (Your csv file path)
```
#### example.csv
In there, `owner` is the private key of the hero's owner(We need private key because Elpis Battle's Login API need to sign a message to be able to login into the system) and `scholar` is the address of the person to whom the owner wants to send an invitation to play on his account.
```dosini
owner,scholar
0x....,0x....
........
```

### Run
After filling in all the environment variables, run the command:
```sh
yarn start
```

