import "dotenv/config";
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";

// const client = wrapOpenAI(new OpenAI());

const client = wrapOpenAI(new OpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama", // The SDK requires a string, but Ollama ignores it
}));

const myTool = traceable(async (question: string) => {
  return "During this morning's meeting, we solved all world conflict.";
}, { name: "Retrieve Context", run_type: "tool" });

const chatPipeline = traceable(async (question: string) => {
  const context = await myTool(question);
  const messages = [
      {
          role: "system" as const,
          content:
              "You are a helpful assistant. Please respond to the user's request only based on the given context.",
      },
      { role: "user" as const, content: `Question: ${question} Context: ${context}` },
  ];
  const chatCompletion = await client.chat.completions.create({
      model: "phi3.5:latest",       
      messages: messages,
  });   
  return chatCompletion.choices[0]?.message?.content ?? "No response generated";
}, { name: "Chat Pipeline" });

( async () => {
console.log(await chatPipeline("Can you summarize this morning's meetings?"))   

}) ()