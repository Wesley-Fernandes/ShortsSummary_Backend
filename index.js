import 'dotenv/config'
import express from "express";
import cors from "cors";
import fs from "fs";
import ytdl from "ytdl-core";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { OpenAI } from "openai";

const app = express();
const server = createServer(app);


export const openai = new OpenAI(({
  apiKey: process.env.OPENAI
}));


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

app.use(cors());


app.use(express.json());

async function transcribeAudioOpenai(archive) {
  const transcription = await openai.audio.transcriptions.create({
    file: archive,
    model: "whisper-1",
    temperature: "1",
  });
  return transcription.text;
}

async function resumeTranscription(transcription) {
  const resume = await openai.completions.create({
    model: "text-davinci-003",
    prompt: `Sabendo que isso é o texto de um vídeo, crie um resumo dele, igual o exemplo abaixo:
          Esse vídeo fala sobre um canal de culinária que...

          Agora é o texto do vídeo:
      :\n\n ${transcription}`,
    max_tokens: 500,
    temperature: 0
  });

  return resume.choices[0].text;
}

io.on("connection", async (socket) => {
  const socketID = socket.id;
  console.log(`Um cliente se conectou: ${socketID}`);
  io.to(socketID).emit("status", "Em espera...");

  app.post("/summary/:id", async (request, response) => {
    let register = request.body.register;

    io.to(socketID).emit("status", "Work.");

    try {
      const id = request.params.id;
      const videoURL = `https://www.youtube.com/shorts/${id}`;
      const writeStream = fs.createWriteStream("./temp/audio.mp4");

      ytdl(videoURL, { quality: "lowestaudio", filter: "audioonly" })
        .on("info", async (info) => {
          const seconds = info.formats[0].approxDurationMs / 1000;

          if (seconds >= 60) {
            const error = "O vídeo é maior que 60 segundos.";
            socket.to(socketID).emit("status", error);
            return response.send(error);
          }

          io.to(socketID).emit("status", "Fazendo download...");
        })
        .on("end", async () => {
          try {
            async function startProcess(response) {
              const archive = fs.createReadStream("./temp/audio.mp4");
              io.to(socketID).emit("status", "Transcrevendo vídeo...");
              const transcript = await transcribeAudioOpenai(archive);
              io.to(socketID).emit("status", "Criando resumo do vídeo...");
              const resume = await resumeTranscription(transcript);
              io.to(socketID).emit("status", "Concluído.");
              return response.send(resume);
            }

            await startProcess(response);
          } catch (error) {
            return response.send({ error });
          }
        })
        .on("error", (error) => {
          return response.send({ error });
        })
        .pipe(writeStream);
    } catch (error) {
      return response.send({ error });
    }
  });
});

const PORT = process.env.PORT || 5252;
server.listen(PORT, () => {
  console.log(`Servidor está ouvindo na porta ${PORT}`);
});
