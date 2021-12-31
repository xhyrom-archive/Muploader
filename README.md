## How to install

Requirements:
- NodeJS v16+ [Windows](https://nodejs.org) [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
- Git [Windows](https://git-scm.com/) [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-20-04)
- Build Essential (Required for Ubuntu)
    - `sudo apt-get install build-essential`

```bash
git clone https://github.com/xHyroM/Muploader.git
cd Muploader

npm ci

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

If you want [ShareX](https://getsharex.com) support, you need enable `NEXT_PUBLIC_SHAREX_SUPPORT` in `.env.local`  
Then when you launch the page you go to the Config page (in navbar) where the config will be generated.
^ You need edit URL and Authorization (if you have enabled `NEXT_PUBLIC_AUTHORIZATION`)  