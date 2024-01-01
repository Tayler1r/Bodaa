console.log(require('chalk').dim(`   ======>>>> This Tool Devoleped By Tayler <<<<======\n`))
const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
let currentTokenIndex = 0;
let usageCounter = 0;
let currentProxyIndex = 0
// process.on("unhandledRejection", (reason, promise) => { return })
async function readNextDiscordTokenFromFile() {
    try {
        const data = await fs.readFile('tokens.txt', 'utf-8');
        const tokens = data.trim().split('\n');

        if (currentTokenIndex < tokens.length) {
            const nextToken = tokens[currentTokenIndex];
            currentTokenIndex += 1;
            return nextToken.trim();
        } else {
            console.error('( + ) All Tokens Done');
            return null;
        }
    } catch (error) {
        console.error('Error Reading Discord Tokens :', error.message);
        return null;
    }
}
puppeteer.use(pluginStealth());
puppeteer.use(
	RecaptchaPlugin({
		provider: {
			id: "capmonster",
			token: "Your Capmonster Key" 
		},
		visualFeedback: true 
	})
);
async function runBot() {
    usageCounter++;
    const DISCORD_TOKEN = await readNextDiscordTokenFromFile();
    if (!DISCORD_TOKEN) {
        console.error('( - ) Error Find Account Token .');
        return;
    }
    const browser = await launchBrowserWithProxy();
    const page = await browser.newPage();
    await page.authenticate({
        email: 'tvabdo197@gmail.com',
        password: 'xN!2$YnsN8Fi.vG'
    });
    try {
        const websiteURL = 'https://probot.io/daily';
        await page.goto(websiteURL);
        await page.waitForTimeout(5000);
        await page.evaluate((discordToken) => {
          function login(token) {
              setInterval(() => {
                  document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage.token = `"${token}"`;
              }, 50);
              setTimeout(() => {
                  location.reload();
              }, 2500);
          }
          login(discordToken);
      }, DISCORD_TOKEN);
        await page.waitForSelector('.contents_fb6220');
        await page.click('.contents_fb6220');
        await page.waitForTimeout(2000);
        await page.goto('https://probot.io/daily');
        await page.waitForSelector('.fas');
        await page.waitForTimeout(2000);
        await page.click('.fas');
        const browserContexts = browser.browserContexts();
        await page.waitForTimeout(5000);
        for (const browserContext of browserContexts) {
            const pages = await browserContext.pages();
            await pages[2].evaluate(() => {
                const authorizeButton = Array.from(document.querySelectorAll("div"))
                    .find((e) => e.innerText === "Authorize");
                if (authorizeButton) {
                    authorizeButton.parentElement.click();
                }
            });
        }
        await page.waitForTimeout(10000);
        const page2 = await browser.newPage();
        page2.goto('https://probot.io/daily')
        await page2.waitForTimeout(5000);
        await page2.waitForSelector('.daily-logo-text', { timeout: 100000 });
        await page2.waitForTimeout(2000);
        await page2.click('.daily-logo-text');
        await page.waitForTimeout(5000);
        for (const browserContext of browserContexts) {
            const pages = await browserContext.pages();
            await pages[4].evaluate(async () => {
                const authorizeButton = Array.from(document.querySelectorAll("div"))
                    .find((e) => e.innerText === "Authorize");
                if (authorizeButton) {
                    authorizeButton.parentElement.click();
                    await page2.waitForSelector('.daily-logo-text', { timeout: 100000 });
                    await page2.waitForTimeout(2000);
                    await page2.click('.daily-logo-text');
                }
            });
        }
        await page2.waitForTimeout(2000);
        await page2.solveRecaptchas();
        await page2.waitForTimeout(4000);
        const waitForClaimedText = async (page2) => {
          let claimedText = '';
          while (!claimedText.includes('claimed')) {
            const result = await page2.evaluate(() => {
              const element = document.querySelector('.daily-number');
              if (element) {
                return element.innerText.trim();
              } else {
                return '( - ) Error To Find Claimed Number';
              }
            });
            claimedText = result.toLowerCase();
            if (!claimedText.includes('claimed')) {
              await page2.waitForTimeout(1000);
            } else {
            const regex = /\d+/;
            const match = result.match(regex);
            if (match) {
              const number = parseInt(match[0], 10);
              console.log(require('chalk').green(`( + ) The Token : ${DISCORD_TOKEN}`));
              console.log(require('chalk').green(`Claimed From Token  : ${number}`));
            } else {
              console.log("( - ) Error To Find Claimed Number");
            }
          }}}
          await page2.waitForTimeout(2000);
          await waitForClaimedText(page2);
          await updateTokenFiles(DISCORD_TOKEN)
    } catch (err) {
    console.log(err)
        await browser.close()
        await runBot()
    }
}
async function updateTokenFiles(usedToken) {
    try {
        const data = await fs.readFile('tokens.txt', 'utf-8');
        let tokens = data.trim().split('\n');
        tokens = tokens.filter(token => token.trim() !== usedToken.trim());
        await fs.writeFile('tokens.txt', tokens.join('\n'));
        await fs.appendFile('claimed.txt', usedToken + '\n');
    } catch (error) {
        console.error('Error updating token files:', error.message);
    }
}
async function resetPPPOEConnection(browser) {
    let ping = await PingChecker.getPing();
    let restart_counter = 0;
    while (!(ping.max != 'unknown' && ping.max <= 70)){
        await PPPOE.reset_pppoe();
        restart_counter++;
        ping = await PingChecker.getPing();
    }
}
// resetPPPOEConnection();
  runBot();
  async function launchBrowserWithProxy() {
    const proxy = await getNextProxy();

    try {
        console.log(chalk.yellow(`Trying to launch the browser with proxy: ${proxy}`));
        const browser = await puppeteer.launch({ headless: false, args: [`--proxy-server=${proxy}`,] });
        console.log(chalk.green(`Browser launched successfully with proxy: ${proxy}`));

        const page = await browser.newPage();
        await page.goto('https://probot.io/daily');


        if (page.url() === 'https://probot.io/daily') {
            console.log(chalk.green(`Browser successfully navigated to the target page with proxy: ${proxy}`));
        } else {
            console.error(chalk.red(`Error: Browser did not navigate to the target page with proxy ${proxy}.`));
            await browser.close();
            return null;
        }

        return browser;
    } catch (error) {
        console.error(chalk.red(`Error launching the browser with proxy ${proxy}:`, error));
        return null;
    }
}
const chalk = require('chalk')
async function getNextProxy() {
    const proxyFilePath = 'proxy.txt';

    try {
        const data = await fs.readFile(proxyFilePath, 'utf-8');
        const proxyList = data.split('\n').map(line => line.trim()).filter(Boolean);

        const proxy = proxyList[currentProxyIndex % proxyList.length];
        currentProxyIndex++;

        return proxy;
    } catch (error) {
        console.error('Error reading proxy file:', error.message);
        return null;
    }
}

async function launchBrowserWithProxy() {
    const proxy = await getNextProxy();

    try {
        console.log(chalk.yellow(`Trying to launch the browser with proxy: ${proxy}`));
        const browser = await puppeteer.launch({ headless: false, args: [`--proxy-server=${proxy}`,] });
        console.log(chalk.green(`Browser launched successfully with proxy: ${proxy}`));

        return browser;
    } catch (error) {
        console.error(chalk.red(`Error launching the browser with proxy ${proxy}:`, error));
        return null;
    }
}