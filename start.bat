@echo off
echo Initializing project...
npm init -y

echo Installing firebase-admin...
npm install firebase-admin

echo Importing data...
node importData.js

echo Installing project dependencies...
npm install

echo Starting development server...
npm run dev

pause
