# Wrike Trans Bot

> ## Steps to setup and run in localhost

### Create App in Wrike
Note: Wrike API Apps cannot be shared between user accounts!
- Go to Wrike `Apps & Integrations`
- Go to `API` from left menu
- Give app name in the presented field and press `Create new`
- At the app `configuration` page
    - At the bottom `Permanent access token` section
        - Press `Create v4 Token`
        - Later you will need to copy the `token` in the .env as `WRIKE_APP_PERMANENT_TOKEN`

### Install development tools
- Git:  
    - Installation  
        - mac:  
        `brew install git`  
        - linux:  
        `sudo apt-get update`  
        `sudo apt-get install git`  
        - windows:  
        Download windows installer from [here](https://gitforwindows.org)  
        Complete Git setup using the installer  
        Open `Command Prompt` or `Git Bash` to configure you git  
    - Configuration   
    `git config --global user.name "Your-Name"`  
    `git config --global user.email "email@groots.co.jp"`  
- Install node:  
    - mac:  
    `brew install node`  
    - linux:  
    `pkg install node`  
    - windows:  
    Download windows installer from [here](https://nodejs.org/en/download/)  
- Install `yarn` globally from `terminal` or `bash`:  
`npm i -g yarn`  

### Get the Wrike Trans Bot repository

- Open `terminal` or `bash`
- Download (Clone) the repo  
  `git clone https://github.com/grootsinc/wrike-webhook-japanese-trans-bot.git ~/wrike-webhook-japanese-trans-bot`  
  *This will clone the repo into your home directory*  
  *in `wrike-webhook-japanese-trans-bot` folder*  
- change directory to inside the project folder  
  `cd ~/wrike-webhook-japanese-trans-bot`

### Setup the Wrike trans bot webhook server

- Install dependencies  
  `yarn install`  
- Create e google cloud project to use google `Cloud Translate API`  
  - enable the `Cloud Translate API`
  - download the application credential file and place at `src/cnfig`
- Setup the `.env`  
  Set your `PORT=` to someting like `6000`  
  Set your app name with `WRIKE_APP_NAME=`  
  Set `WRIKE_APP_PERMANENT_TOKEN=` from your app `configuration` page  
  Set `GOOGLE_APPLICATION_CREDENTIALS=` to your google cloud application key file localtion  

### Run Wrike trans bot webhook server

- Run  
  `yarn start` or  
  `yarn dev`  
- Expose server using ngrok  
  `ngrok http <port>`
- Setup webhook (Following request was curl'ed to set up the webhook)  
  `curl -g -X POST -H 'Authorization: bearer <WRIKE_APP_PERMANENT_TOKEN>' -d 'hookUrl=https://id.ngrok.io/webhook&events=[CommentAdded,FolderCommentAdded]' 'https://www.wrike.com/api/v4/webhooks'`
