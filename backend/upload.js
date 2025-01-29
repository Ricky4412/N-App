const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Error: Dropbox access token is not set.');
  process.exit(1);
}

const dbx = new Dropbox({ accessToken: ACCESS_TOKEN, fetch });

const uploadFile = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error('Error: File path does not exist:', filePath);
    return;
  }

  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  try {
    const response = await dbx.filesUpload({ path: '/' + fileName, contents: fileContent });
    console.log('File uploaded successfully:', response);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

module.exports = { uploadFile };
