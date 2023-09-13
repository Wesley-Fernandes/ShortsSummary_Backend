import 'dotenv/config'
import { OpenAI } from "openai"
import fs from "fs"


const openaiURL = "https://api.openai.com/v1/audio/transcriptions";
export const openai = new OpenAI(({
    apiKey: process.env.OPENAI
}));
