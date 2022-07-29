const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
require("dotenv").config({ path: __dirname + "/.env" });

const { getEmbedSharedData, generateHTML } = require("./utils");

const pathToIGLinks = path.resolve(__dirname, "../data/instagram-link.txt");
const fileData = fs.readFileSync(pathToIGLinks, "utf-8");

const shortCodes = fileData
  .split(/\r?\n/)
  .filter((link) => link.trim())
  .map((link) => link.replace("reel", "p").split("/p/")[1].split("/")[0]);

if (!shortCodes.length) throw new Error("No links to parse!");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // await instagramLogin(page, process.env.IG_LOGIN, process.env.IG_PASSWORD);

  let sharedData = [];

  for (const shortCode of shortCodes) {
    try {
      const data = await getEmbedSharedData(page, shortCode);
      await page.waitForTimeout(2345);
      sharedData.push(data);
    } catch (error) {
      console.log(`ERROR: ${shortCode} has been skipped`);
    }
  }

  const view = generateHTML(JSON.stringify(sharedData));
  const pathToHTML = path.resolve(__dirname, "../client/public/index.html");
  fs.writeFileSync(pathToHTML, view);

  await browser.close();
})();
