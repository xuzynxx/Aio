export function detectPlatform(url: string) {
  const patterns: Record<string, RegExp> = {
    youtube: /youtube\.com|youtu\.be/,
    tiktok: /tiktok\.com/,
    instagram: /instagram\.com/,
    spotify: /spotify\.com/,
    facebook: /facebook\.com|fb\.watch/,
    twitter: /twitter\.com|x\.com/,
    pinterest: /pinterest\.(com|id|fr)/,
    reddit: /reddit\.com/,
    vimeo: /vimeo\.com/,
  };

  for (const [platform, regex] of Object.entries(patterns)) {
    if (regex.test(url)) return platform;
  }
  return null;
}
