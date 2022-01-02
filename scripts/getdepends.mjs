import fs from 'fs';

const json = Object.entries(JSON.parse(fs.readFileSync('./package.json', 'utf-8')).dependencies);
const jsonDev = Object.entries(JSON.parse(fs.readFileSync('./package.json', 'utf-8')).devDependencies);

console.log(json.map(d => `npm i ${d[0]}`).join(' && '))
console.log(jsonDev.map(d => `npm i ${d[0]} --save-dev`).join(' && '))