const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

async function fetchId() {

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
      '--enable-features=NetworkService'
    ]
  });

  const url = `${process.env.HOST}/NetActSSO/token`;
  let token = null;
  await axios.post(url, {
    "username": process.env.USER_NAME,
    "password": process.env.PASSWORD
      }, {
    headers: {
      'Content-Type': 'application/json'
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  })
    .then(res => token = res.data.token)
    .catch(error => console.error(error));
  
  
  if (token) {
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(80000);
    await page.goto(`${process.env.HOST}/?token=${token}`, {
      waitUntil: 'networkidle0'
    });

    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i) {
        let message = msg.text();
        if (message.includes('Set session id')) {
          const str = message.split(' ');
          const strIndex = str.indexOf('id');
          const sessionId = str[strIndex + 1];
          const regex = /\r\n/i;
          console.log(sessionId.replace(regex, ''));
          fs.writeFile('sessionId.txt', message, function (err) {
            if (err) return console.log(err);
          });
        }
      }
    });
    await page.screenshot({ path: "example.png" });
  }
  await browser.close();
}
const delay = 15 * 60000;

setInterval(() => {
  console.log('new iteration');
  fetchId();
}, delay);

fetchId();
