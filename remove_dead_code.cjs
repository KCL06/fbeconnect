const fs = require('fs');
let text = fs.readFileSync('src/app/pages/Landing.tsx', 'utf-8');
const pattern = /\{\!isLogin && \(\s*<div>\s*<label[\s\S]*?\{\/\* Expert Fields \*\/\}[\s\S]*?<\/div>\s*<\/>\s*\)\}/g;
const newText = text.replace(pattern, '');
fs.writeFileSync('src/app/pages/Landing.tsx', newText, 'utf-8');
console.log('Done');
