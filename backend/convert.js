import express from "express";
import { execFile } from "child_process";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

const router = express.Router();

const UPLOAD_DIR = "uploads";
const OUTPUT_DIR = "converted";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const WAV_FILENAME = "recording.wav";
const FLAC_FILENAME = "recording.flac";

const wavPath = path.join(UPLOAD_DIR, WAV_FILENAME);
const flacPath = path.join(OUTPUT_DIR, FLAC_FILENAME);

router.post("/convert", async (req, res) => {
  const { audio_base64 } = req.body;

  if (!audio_base64) {
    return res.status(400).json({ error: "audio_base64 is required" });
  }

  try {
    const audioBuffer = Buffer.from(audio_base64, "base64");
    fs.writeFileSync(wavPath, audioBuffer); // Overwrite if exists

    execFile(
      ffmpegPath,
      ["-y", "-i", wavPath, flacPath],
      (err, stdout, stderr) => {
        if (err) {
          console.error("FFmpeg error:", stderr);
          return res.status(500).json({ error: "Conversion failed" });
        }

        res.sendFile(path.resolve(flacPath));
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
