const puppeteer = require('puppeteer');

const HOST = process.argv[2];
const USER_NAME = process.argv[3];
const PASSWORD = process.argv[4];

async function fetchSessionId() {
  console.log("Create browser");
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
      '--enable-features=NetworkService'
    ]
  });

  const page = await browser.newPage();
  
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i) {
      let message = msg.text();
      if (message.includes('Set session id')) {
        const str = message.split(' ');
        const strIndex = str.indexOf('id');
        const sessionId = str[strIndex + 1];
        const regex = /\r\n/i;
        console.log(sessionId.replace(regex, ''));
      }
    }
  });


  await page.setDefaultNavigationTimeout(80000);
  await page.goto(`${HOST}`, {waitUntil: 'networkidle2'});
  await page.waitForSelector('.login-container');
  await page.type('input[name=userName]', USER_NAME);
  await page.type('input[type=password]', PASSWORD);
  await page.click('#login-view > div > div > div.main-view > ng-view > div > form > div:nth-child(4) > div.simple-container > div > ui-button > button', {waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(60000);
  console.log("Close browser");
  await browser.close();
}

fetchSessionId();
