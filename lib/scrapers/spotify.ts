import axios from "axios";
import * as cheerio from "cheerio";

// Spotify V1 (FabDL)
async function scrapeFabDL(url: string) {
  try {
    const res = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`);
    const { result } = res.data;
    const trackId = result.type === "album" ? result.tracks[0].id : result.id;
    
    const convert = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${result.gid}/${trackId}`);
    const tid = convert.data.result.tid;
    
    const progress = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-progress/${tid}`);
    return {
      title: result.name,
      thumbnail: result.image,
      url: `https://api.fabdl.com${progress.data.result.download_url}`,
    };
  } catch {
    return null;
  }
}

// Spotify V2 (Spotimate) - tanpa Turnstile (fallback)
async function scrapeSpotimate(url: string) {
  try {
    const home = await axios.get("https://spotimate.io/");
    const $ = cheerio.load(home.data);
    const tokenInput = $("input[type='hidden']").first();
    const tokenName = tokenInput.attr("name");
    const tokenValue = tokenInput.attr("value");
    
    if (!tokenName || !tokenValue) return null;

    const res = await axios.post("https://spotimate.io/action", 
      new URLSearchParams({ url, [tokenName]: tokenValue }),
      { headers: { "content-type": "application/x-www-form-urlencoded" } }
    );
    
    const $res = cheerio.load(res.data.html || res.data);
    const mp3Link = $res('a:contains("Download Mp3")').first().attr("href");
    if (mp3Link) {
      return {
        title: $res("h3 div").text().trim(),
        thumbnail: $res("img").first().attr("src"),
        url: mp3Link.startsWith("http") ? mp3Link : `https://spotimate.io${mp3Link}`,
      };
    }
  } catch {}
  return null;
}

export async function scrape(url: string) {
  let result = await scrapeFabDL(url);
  if (!result) result = await scrapeSpotimate(url);
  if (!result) throw new Error("Spotify: No links found");
  
  return {
    title: result.title,
    thumbnail: result.thumbnail,
    urls: [result.url],
  };
}
