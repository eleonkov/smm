const util = require("util");
const stream = require("stream");
const pipeline = util.promisify(stream.pipeline);
const fs = require("fs");
const axios = require("axios");
const moment = require("moment");

const instagramLogin = async (page, login, password) => {
  await page.goto("https://www.instagram.com/");
  // await page.click("button.aOOlW.HoLwm");
  await page.waitForTimeout(3000);

  await page.type('[name="username"]', login);
  await page.waitForTimeout(1500);
  await page.type('[name="password"]', password);
  await page.waitForTimeout(1500);
  await page.click('[type="submit"]');
  await page.waitForTimeout(1500);

  await page.waitForNavigation();
  await page.waitForTimeout(7000);
};

const smmplannerLogin = async (page, login, password) => {
  await page.goto("https://smmplanner.com/home/auth/signin");
  await page.waitForTimeout(3000);

  await page.type('.MuiFormControl-root [name="email"]', login);
  await page.waitForTimeout(1500);

  await page.type('.MuiFormControl-root [name="password"]', password);
  await page.waitForTimeout(1500);

  await page.click('form [type="submit"]');

  await page.waitForNavigation();
  await page.waitForTimeout(7000);
};

const getEmbedSharedData = async (page, shortcode) => {
  await page.goto(`https://www.instagram.com/p/${shortcode}/embed/captioned/`);
  await page.waitForTimeout(1000);

  const sharedData = await page.evaluate(async () => {
    if (window.__additionalData.extra.data) {
      return window.__additionalData.extra.data.shortcode_media;
    }

    if (
      document.querySelector(".Content .EmbedSidecar") ||
      document.querySelector(".Content .EmbedVideo") ||
      document.querySelector(".Content .WatchOnInstagramContainer")
    ) {
      return null;
    }

    const display_url = document.querySelector("img.EmbeddedMediaImage").src;
    const count = +document
      .querySelector(".SocialProof a")
      .innerText.replace(" likes", "")
      .replace(",", "");
    const text = document
      .querySelector(".Caption")
      .innerHTML.replace("<br>", "\n")
      .replace(/<\/?[^>]+(>|$)/g, "");

    return {
      __typename: "GraphImage",
      edge_liked_by: { count },
      taken_at_timestamp: null,
      edge_media_to_caption: { edges: [{ node: { text } }] },
      display_url,
    };
  });

  let resources = [];

  // Do not support single image, should be fixed in feature!
  if (!sharedData) return Promise.reject("Do not support single image");

  if (sharedData.__typename === "GraphSidecar") {
    resources = sharedData.edge_sidecar_to_children.edges.map(({ node }) => {
      return node.__typename === "GraphVideo"
        ? node.video_url
        : node.display_url;
    });
  }

  if (sharedData.__typename === "GraphVideo") {
    resources = [sharedData.video_url];
  }

  if (sharedData.__typename === "GraphImage") {
    resources = [sharedData.display_url];
  }

  if (!resources || !resources.length) return Promise.reject("No resources");
  sharedData.taken_at_timestamp =
    sharedData.taken_at_timestamp || moment().subtract(60, "seconds").unix();

  console.log(shortcode, { likes: sharedData?.edge_liked_by?.count });

  return {
    resources,
    typename: sharedData.__typename,
    message: sharedData?.edge_media_to_caption?.edges?.[0]?.node?.text,
    likes: sharedData?.edge_liked_by?.count,
    comments: sharedData?.edge_media_to_comment?.count || 0,
    timestamp:
      sharedData.taken_at_timestamp || moment().subtract(60, "seconds").unix(),
    shortcode,
  };
};

const getPostsByUserName = async (page, username) => {
  const result = [];

  await page.goto(`https://www.instagram.com/${username}/`);
  await page.waitForTimeout(5000);

  const shortCodes = await page.evaluate(() =>
    Array.from(document.querySelectorAll('._aayp [role="link"]'), (link) =>
      link.href.split("/p/")[1].replace("/", "")
    )
  );

  for (let i = 0; i < 10; i++) {
    try {
      const sharedData = await getEmbedSharedData(page, shortCodes[i]);
      result.push(sharedData);
    } catch (error) {
      console.log("error", shortCodes[i]);
      continue;
    }
  }

  return result;
};

const generateHTML = (data) => `
    <!DOCTYPE html>
    <html>
        <head><meta charset="utf-8"/></head>
        <body>
            <div id="root"></div>
            <script>window._sharedData=${data}</script>
        </body>
    </html>
`;

const downloadFile = async (fileUrl, outputLocationPath) => {
  try {
    const request = await axios.get(fileUrl, { responseType: "stream" });
    await pipeline(request.data, fs.createWriteStream(outputLocationPath));
    console.log("Download pipeline successful");
  } catch (error) {
    console.error("Download pipeline failed", error);
  }
};

const getDescription = ({ message, source: { via, owner, photo }, tags }) => {
  const getMessage = () =>
    message
      ? `${message} Follow @${process.env.SMM_ACCOUNT} For More 🎌\n\n`
      : "";

  const getSource = () => {
    let source = "";

    if (owner) source += `🚘 Owner: ${owner}\n`;
    if (!owner && !via)
      source += "⚠️ Please share the Owner in the comments section below\n";
    if (photo) source += `📸 Photo: ${photo}\n`;
    if (via) source += `🔗 Via:   ${via}\n`;

    return source;
  };

  const getTags = () => tags.join(" ");

  return `${getMessage()}Double Tap 👍\nTag ✏ Friends, Follow and Support!\n\n${getSource()}\nTags: ${getTags()}`;
};

module.exports = {
  instagramLogin,
  smmplannerLogin,
  getPostsByUserName,
  generateHTML,
  downloadFile,
  getDescription,
  getEmbedSharedData,
};
