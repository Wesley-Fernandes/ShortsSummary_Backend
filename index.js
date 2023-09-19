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
    origin: "*"
  }
});


app.use(cors());


app.use(express.json());
const connectedUsers = {};

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
    prompt: `
    1 - É o texto sobre um vídeo.\n
    2 - Crie um resumo dele sem fazer perguntas.\n
    3 - Não invente nada, apenas use o conteudo do video.\n
    4 - Não escreva 'Resumo:' no inicio do resumo.\n
    5 - Não repita o texto que você deve resumir, crie o resumo total.\n
    6 - Apenas me envie a resposta, nada além.
    \n\n

    Abaixo é o texto do vídeo que você deve resumir:
    \n\n ${transcription}`,
    max_tokens: 500,
    temperature: 0
  });

  return resume.choices[0].text;
}

function getUserIdBySocketId(socketId) {
  for (const userId in connectedUsers) {
    if (connectedUsers[userId] === socketId) {
      return userId;
    }
  }
  return null;
}

io.on("connection", async (socket) => {
  connectedUsers[socket.id] = socket.id;
  console.log(connectedUsers)
  io.to(socket.id).emit("status", "pausado");

  app.get("/", (req, res) => {
    res.json({ status: true });
  });

  socket.on('disconnect', () => {
    const disconnectedUserId = getUserIdBySocketId(socket.id);
    if (disconnectedUserId) {
      delete connectedUsers[disconnectedUserId];
    }
  });

  app.post("/summary/:id", async (request, response) => {
    let register = request.body.register;
    socket.to(register).emit("status", "Solicitando...");
    try {
      const id = request.params.id;
      const videoURL = `https://www.youtube.com/shorts/${id}`;
      const writeStream = fs.createWriteStream("./temp/audio.mp4");

      ytdl(videoURL, { quality: "lowestaudio", filter: "audioonly" })
        .on("info", async (info) => {
          const seconds = info.formats[0].approxDurationMs / 1000;

          if (seconds >= 60) {
            const error = "O vídeo é maior que 60 segundos.";
            socket.to(register).emit("status", "Pausado.");
            return response.send(error);
          }
          socket.to(register).emit("status", "Fazendo download...");
        })
        .on("end", async () => {
          try {
            console.log({ socket: register })
            async function startProcess(response) {
              const archive = fs.createReadStream("./temp/audio.mp4");
              socket.to(register).emit("status", "Transcrevendo...");
              const transcript = await transcribeAudioOpenai(archive);
              socket.to(register).emit("status", "Resumindo...");
              const resume = await resumeTranscription(transcript);
              return response.send(resume);
            }

            await startProcess(response);
          } catch (error) {
            return response.status(401).json({ error });
          }
        })
        .on("error", (error) => {
          return response.status(401).json({ error });
        })
        .pipe(writeStream);
    } catch (error) {
      return response.status(401).json({ error });
    }
  });
});

const PORT = process.env.PORT || 5252;
server.listen(PORT, () => {
  console.log(`Servidor está ouvindo na porta ${PORT}`);
});
