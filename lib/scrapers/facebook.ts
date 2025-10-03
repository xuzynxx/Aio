import axios from "axios";
import * as cheerio from "cheerio";

export async function scrape(url: string) {
  try {
    const res = await axios.post("https://fbdown.net/download.php", 
      new URLSearchParams({ URL: url }),
      { headers: { "content-type": "application/x-www-form-urlencoded" } }
    );
    const $ = cheerio.load(res.data);
    const hd = $("#hdlink a").attr("href");
    const sd = $("#sdlink a").attr("href");
    const urls = [hd, sd].filter(Boolean) as string[];
    if (urls.length === 0) throw new Error("No links found");
    return {
      title: "Facebook Video",
      thumbnail: null,
      urls,
    };
  } catch (error: any) {
    throw new Error("Facebook: " + error.message);
  }
}
