// Diambil dari TIKTOK V1 & V2 di scrape.txt, digabung jadi satu
import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";

// --- TikTok V1 (MusicalDown) ---
async function getDownloadLinksMusicalDown(URL: string) {
  try {
    const response = await axios.get("https://musicaldown.com/en", {
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      },
    });
    const $ = cheerio.load(response.data);
    const urlName = $("#link_url").attr("name");
    const tokenName = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("name");
    const tokenValue = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("value");
    const verify = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(3)").attr("value");

    if (!urlName || !tokenName || !tokenValue || !verify) {
      throw new Error("Form data not found");
    }

    const data = {
      [urlName]: URL,
      [tokenName]: tokenValue,
      verify: verify,
    };

    const res = await axios.post("https://musicaldown.com/download", new URLSearchParams(data as any), {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        cookie: response.headers["set-cookie"]?.join("; "),
      },
    });

    const ch = cheerio.load(res.data);
    const links: string[] = [];

    const extractLink = (selector: string) => {
      const el = ch(selector).attr("href");
      if (el?.includes("token=")) {
        const token = el.split("token=")[1].split("&")[0];
        const payload = token.replace(/-/g, "+").replace(/_/g, "/");
        try {
          const json = JSON.parse(Buffer.from(payload, "base64").toString());
          if (json.url) links.push(json.url);
        } catch {}
      }
    };

    extractLink('a[data-event="hd_download_click"]');
    extractLink('a[data-event="mp4_download_click"]');
    extractLink('a[data-event="watermark_download_click"]');

    return links;
  } catch {
    return [];
  }
}

// --- TikTok V2 (SnapTik) ---
async function getDownloadLinksSnapTik(url: string) {
  try {
    const client = axios.create({
      baseURL: "https://snaptik.app",
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      },
    });

    const home = await client.get("/en2");
    const $ = cheerio.load(home.data);
    const token = $("input[name='token']").val() as string;

    const form = new FormData();
    form.append("url", url);
    form.append("lang", "en2");
    form.append("token", token);

    const scriptRes = await client.post("/abc2.php", form, {
      headers: form.getHeaders(),
    });

    const script = scriptRes.data;
    const evalResult = await new Promise<{ html: string }>((resolve) => {
      const mock = {
        $: () => ({ innerHTML: "" }),
        app: { showAlert: () => {} },
        document: { getElementById: () => ({ src: "" }) },
        fetch: (a: string) => {
          resolve({ html: `<a href="${a}">Download</a>` });
          return { json: () => ({}) };
        },
        gtag: () => {},
        Math: { round: () => 0 },
        XMLHttpRequest: function () {
          return { open() {}, send() {} };
        },
        window: { location: { hostname: "snaptik.app" } },
      };
      Function(...Object.keys(mock), script)(...Object.values(mock));
    });

    const $result = cheerio.load(evalResult.html);
    const urls: string[] = [];
    $result('a[href*="http"]').each((_, el) => {
      const href = $result(el).attr("href");
      if (href && !href.includes("play.google.com")) urls.push(href);
    });
    return urls;
  } catch {
    return [];
  }
}

export async function scrape(url: string) {
  let urls = await getDownloadLinksMusicalDown(url);
  if (urls.length === 0) urls = await getDownloadLinksSnapTik(url);
  if (urls.length === 0) throw new Error("TikTok: No links found");
  
  return {
    title: "TikTok Video",
    thumbnail: null,
    urls,
  };
}
