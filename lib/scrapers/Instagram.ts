import axios from "axios";
import * as cheerio from "cheerio";

async function tryFastdl(url: string) {
  try {
    const home = await axios.get("https://fastdl.app/id");
    const $ = cheerio.load(home.data);
    const token = $("input[name='_token']").val() as string;
    
    const res = await axios.post("https://fastdl.app/api/convert", 
      new URLSearchParams({ url, _token: token }),
      { headers: { "content-type": "application/x-www-form-urlencoded" } }
    );
    
    if (res.data?.status && res.data.data?.media) {
      return res.data.data.media.map((m: any) => m.url);
    }
  } catch {}
  return [];
}

async function tryIgram(url: string) {
  try {
    const home = await axios.get("https://igram.world/id/");
    const $ = cheerio.load(home.data);
    const token = $("input[name='_token']").val() as string;
    
    const res = await axios.post("https://igram.world/api/convert",
      new URLSearchParams({ url, _token: token }),
      { headers: { "content-type": "application/x-www-form-urlencoded" } }
    );
    
    if (res.data?.status && res.data.data?.media) {
      return res.data.data.media.map((m: any) => m.url);
    }
  } catch {}
  return [];
}

export async function scrape(url: string) {
  let urls = await tryFastdl(url);
  if (urls.length === 0) urls = await tryIgram(url);
  if (urls.length === 0) throw new Error("Instagram: No links found");
  
  return {
    title: "Instagram Post",
    thumbnail: null,
    urls,
  };
}
