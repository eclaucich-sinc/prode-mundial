const fs = require('fs');
const path = require('path');

const targetUrl = 'https://prode-mundial-t3nt.onrender.com';
const replacement = "${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}";

const filesToUpdate = [
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/Register.jsx',
  'frontend/src/pages/Admin.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace simple string fetches: 'https://...' -> `${import.meta.env...}`
  content = content.replace(/'https:\/\/prode-mundial-t3nt\.onrender\.com([^']*)'/g, '`${import.meta.env.VITE_API_URL || \'https://prode-mundial-t3nt.onrender.com\'}$1`');
  
  // Replace template literals: `https://...` -> `${import.meta.env...}`
  content = content.replace(/`https:\/\/prode-mundial-t3nt\.onrender\.com([^`]*)`/g, '`${import.meta.env.VITE_API_URL || \'https://prode-mundial-t3nt.onrender.com\'}$1`');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
