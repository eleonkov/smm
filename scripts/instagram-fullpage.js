const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { instagramLogin } = require("./utils");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await instagramLogin(page, process.env.IG_LOGIN, process.env.IG_PASSWORD);
  await page.goto(`https://www.instagram.com/jdmfuel/`);
  await page.waitForTimeout(5000);

  const shortCodes = await page.evaluate(async () => {
    return await new Promise((resolve, reject) => {
      let codes = [];
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        const nextCodes = Array.from(
          document.querySelectorAll('._aayp [role="link"]'),
          (link) => link.href.split("/p/")[1].replace("/", "")
        );

        codes = [...new Set([...codes, ...nextCodes])];
        console.log(codes.length);

        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || codes.length > 2000) {
          clearInterval(timer);
          resolve(codes);
        }
      }, 3000);
    });
  });

  const urls = shortCodes.map((code) => `https://www.instagram.com/p/${code}/`);
  const output = path.resolve(__dirname, "../data/instagram-link.txt");
  fs.writeFileSync(output, urls.join("\n"));

  await browser.close();
})();
