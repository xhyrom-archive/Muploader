## How to install

Requirements:
- NodeJS v16+ [Windows](https://nodejs.org) [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
- Git [Windows](https://git-scm.com/) [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-20-04)
- Build Essential (Required for Ubuntu)
    - `sudo apt-get install build-essential`

```bash
git clone https://github.com/xHyroM/Muploader.git
cd Muploader

npm i
npm i -d

# Rename template.env.local to .env.local
mv template.env.local .env.local

# Change enviroments in .env.local 
nano .env.local

# After save
npm run build

npm run start -- -p 8080
# Running!
```

## ShareX Support

If you want [ShareX](https://getsharex.com) support, you need enable `sharexSupport` in `.env.local`  
Then, you can use [this](https://github.com/xHyroM/Muploader/blob/master/tests/sharex.config.json) example config.  
^ You need edit URL, Authorization (if you have enabled `NEXT_PUBLIC_AUTHORIZATION`)  