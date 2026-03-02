import express from "express";
import ytdl from "@distube/ytdl-core";
import ytpl from "ytpl";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("YT Direct Pro Running 🚀");
});

app.get("/video", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL provided" });

  try {
    const info = await ytdl.getInfo(url);
    const videoFormats = ytdl.filterFormats(info.formats, "videoandaudio");
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      mp4: videoFormats.map(f => ({
        quality: f.qualityLabel,
        url: f.url
      })),
      mp3: audioFormats.map(f => ({
        bitrate: f.audioBitrate + "kbps",
        url: f.url
      }))
    });

  } catch (err) {
    res.json({ error: "Failed to fetch video" });
  }
});

app.get("/playlist", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "No URL provided" });

  try {
    const playlist = await ytpl(url, { pages: 1 });

    res.json({
      playlist: playlist.title,
      total: playlist.items.length,
      videos: playlist.items.map(v => ({
        title: v.title,
        url: v.shortUrl
      }))
    });

  } catch (err) {
    res.json({ error: "Failed to fetch playlist" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
