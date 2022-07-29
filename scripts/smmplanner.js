const path = require("path");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const { ACCOUNTS } = require("./utils/constants");

const { smmplannerLogin, downloadFile, getDescription } = require("./utils");
const db = require("../data/smmplanner.json");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

if (!db.length) throw new Error("You do not have any posts!");
if (!ACCOUNTS[process.env.SMM_ACCOUNT])
  throw new Error("We do not have such account in smm planer!");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await smmplannerLogin(page, process.env.SMM_LOGIN, process.env.SMM_PASSWORD);

  await page.goto("https://smmplanner.io/home/posts");
  await page.waitForTimeout(10000);

  await page.click("h6.MuiTypography-root");
  await page.click("ul.MuiMenu-list li:nth-child(3)");

  await page.waitForTimeout(2000);

  const frame = await page
    .frames()
    .find((f) => f.url().startsWith("https://smmplanner.io/iframe/app/"));

  await frame.evaluate(() => {
    document.querySelector(
      `.viewport__content-section select > option:nth-child(${
        ACCOUNTS[process.env.SMM_ACCOUNT]
      })`
    ).selected = true;
    element = document.querySelector(".viewport__content-section select");
    var event = new Event("change", { bubbles: true });
    event.simulated = true;
    element.dispatchEvent(event);
  });

  await frame.waitForTimeout(3000);

  for (let i = 0; i < db.length; i++) {
    await frame.waitForTimeout(3000);
    await frame.click("div.c-ingreed__empty.ng-scope:nth-child(1)");
    await frame.waitForTimeout(1000);

    try {
      const tempFiles = [];

      for (const resource of db[i].resources) {
        const outputType = /\.(jpg|jpeg|webp)/i.test(resource)
          ? ".jpg"
          : ".mp4";
        const outputPath = path.resolve(
          __dirname,
          `../temp/${uuidv4()}${outputType}`
        );
        await downloadFile(resource, outputPath);
        await frame.waitForTimeout(1000);
        tempFiles.push(outputPath);
      }

      // upload files
      const elementHandle = await frame.$('[type="file"]');
      await elementHandle.uploadFile(...tempFiles);
      await frame.waitForTimeout(5000);

      // enter description
      await frame.focus(".modal-body emoji-input");
      await frame.click(".modal-body emoji-input");
      await frame.type(".modal-body emoji-input", getDescription(db[i]));
      await frame.waitForTimeout(1000);

      // submit form
      await frame.click(".modal-footer .btn.btn-primary");
      await frame.waitForTimeout(5000);
    } catch (error) {
      throw error;
    }
  }

  await browser.close();
})();
