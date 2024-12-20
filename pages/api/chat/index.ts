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
              parts: `You are a helpful AI Namely Oral Doctor. I want you to act as a companion to help answer all questions. I want you to help me solve my problem and question. My problem or question is ${message}
        
                ===========
                Return the answer as if you are a chat assistant AND sometimes just use a straight answer like you are a real person talking, no need long explanation (with point or something). Make sure you give an answer based on Indonesian. Don't use words that can confuse me. If you can provide an simple answer, please do it.
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
