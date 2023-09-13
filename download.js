import ytdl from "ytdl-core";
import fs from "fs"
import { startProcess } from "./openai.js";

export const downloader = (id, res) => {
  const videoURL = "https://www.youtube.com/shorts/".concat(id);
  const writeStream = fs.createWriteStream("./temp/audio.mp4");

  ytdl(videoURL, { quality: "lowestaudio", filter: "audioonly" })
    .on("info", (info) => {

      const seconds = info.formats[0].approxDurationMs / 1000;

      if (seconds > 60) {
        return res.send({ error: "O Video é maior que 60 segundos." });
      }


    }).on("end", async () => {

      startProcess(res);

    }).on("error", (err) => {

      return res.send({ erro: err })

    }).pipe(writeStream)

}