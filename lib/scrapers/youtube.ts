import axios from "axios";

export async function scrape(url: string) {
  try {
    const res = await axios.get(`https://cobalt.tools/api/json`, {
      params: { url },
    });
    if (res.data.status === "error") throw new Error(res.data.text);
    
    return {
      title: res.data.title,
      thumbnail: res.data.thumbnail,
      urls: [res.data.url],
    };
  } catch (error: any) {
    throw new Error("YouTube: " + (error.response?.data?.text || error.message));
  }
}
