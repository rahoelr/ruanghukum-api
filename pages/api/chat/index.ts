import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Response } from "@/src/helper/apiResponse";

const YOUR_GEMINI_API_KEY = "AIzaSyAgBfSe48299uisaHx2GcTU10lA_4liWec";

interface ChatApiRequest extends NextApiRequest {
  body: {
    message: string;
  };
}

let chatHistory: any[] = [];

export default async function handler(
  req: ChatApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    const { message } = req.body;
    const genAI = new GoogleGenerativeAI(YOUR_GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const history =
      chatHistory.length > 0
        ? chatHistory
        : [
            {
              role: "user",
              parts: `You are an AI who helps with dump truck problems and machine repair problems. I would like you to act as a partner to help answer all questions. I would like you to help me solve my problems and questions. My problem or question is ${message}
        
                ===========
                Return answers as if you were a chat assistant AND sometimes just use direct answers as if you were a real person talking, no need for lengthy explanations (with points or anything like that). Make sure you give answers based on Indonesian. Don't use words that might confuse me. Please do that.
                ===========

                Return the answer in Bahasa Indonesia.
                `,
            },
            {
              role: "model",
              parts: "Great to meet you. What would you like to know?",
            },
          ];

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    chatHistory = await chat.getHistory();

    const result = await chat.sendMessage(message);

    return Response(res, 200, "Success", {
      type: "chat",
      payload: {
        message: result?.response?.candidates?.[0].content.parts[0].text,
      },
    });
  } else {
    res.status(405).end();
  }
}
