import { NextRequest } from "next/server";
import { detectPlatform } from "@/lib/detectPlatform";
import * as TikTok from "@/lib/scrapers/tiktok";
import * as Instagram from "@/lib/scrapers/instagram";
import * as Spotify from "@/lib/scrapers/spotify";
import * as YouTube from "@/lib/scrapers/youtube";
import * as Facebook from "@/lib/scrapers/facebook";
import * as Twitter from "@/lib/scrapers/twitter";
import * as Pinterest from "@/lib/scrapers/pinterest";
import * as Reddit from "@/lib/scrapers/reddit";
import * as Vimeo from "@/lib/scrapers/vimeo";

const scrapers: Record<string, any> = {
  tiktok: TikTok,
  instagram: Instagram,
  spotify: Spotify,
  youtube: YouTube,
  facebook: Facebook,
  twitter: Twitter,
  pinterest: Pinterest,
  reddit: Reddit,
  vimeo: Vimeo,
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json({ status: false, error: "URL required" }, { status: 400 });
    }

    const platform = detectPlatform(url);
    if (!platform || !scrapers[platform]) {
      return Response.json({ status: false, error: "Platform tidak didukung" }, { status: 400 });
    }

    const result = await scrapers[platform].scrape(url);
    if (!result || result.error) {
      return Response.json({ status: false, error: "Gagal scrape" }, { status: 500 });
    }

    return Response.json({ 
      status: true, 
       { ...result, platform } 
    });
  } catch (error: any) {
    return Response.json({ status: false, error: error.message }, { status: 500 });
  }
}
