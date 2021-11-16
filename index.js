const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const https = require('https');

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

  const payload = {
    "username": "Nemuadmin",
    "password": "nemuuser"
  };

  const url = 'https://10.28.0.251:9443/NetActSSO/token';
  let token = null;
  await axios.post(url, payload, {
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
    //const arrayLogs = [];

    await page.setDefaultNavigationTimeout(50000);
    await page.goto(`https://10.28.0.251:9443/?token=${token}`, {
      waitUntil: 'networkidle0'
    });

    page.on('console', async msg => {
      for (let i = 0; i < msg.args().length; ++i) {
        let message = msg.text();
        if (message.includes('Set session id')) {
          const str = message.split(' ');
          const strIndex = str.indexOf('id');
          const strId = str[strIndex + 1];
          const regex = /\r\n/i;
          await console.log(strId.replace(regex, ''));
          fs.writeFile('strId.txt', strId.replace(regex, ''), function (err) {
            if (err) return console.log(err);
          });
        }
      }
    });
    //await page.screenshot({ path: "example.png" });
    // const writeStream = fs.createWriteStream('file.txt');
    // arrayLogs.forEach(value => writeStream.write(`${value}\n`));
    // writeStream.end();
  }

  //await browser.close();
}
const delay = 15 * 60000;

setTimeout(() => {
  console.log('timeout beyond time');
  fetchId();
}, delay);

fetchId();
