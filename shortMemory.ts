import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";

// Initialize local model
const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "phi3.5:latest",
});

// new ChatOllama({baseUrl : string, model : string})

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful AI terminal assistant."],
    new MessagesPlaceholder("chat_history"), // Memory gets injected right here!
    ["user", "{input}"],
]);
    
// ChatPromptTemplate.fromMessages([["role", "prompts"], new MessagesPlaceholder("chat_history"), ["user", "{input}"]])
// new MessagesPlaceholder("chat_history"), -> memory was injected here


const chain = prompt.pipe(model);   

// 3. Create an in-memory database to store the conversation
const messageHistories: Record<string, ChatMessageHistory> = {};

// 4. Wrap your chain with the memory manager
const agentWithMemory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async (sessionId) => {
        if (!messageHistories[sessionId]) {
            messageHistories[sessionId] = new ChatMessageHistory();
        }
        return messageHistories[sessionId];
    },
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});

// === Execution Example ===
async function runSession() {
    // First message
    await agentWithMemory.invoke(
        { input: "Hi, I am building a Web OS." },
        { configurable: { sessionId: "session_01" } } // The unique ID for this thread
    );

    // Second message: The model will remember the first one!
    const response = await agentWithMemory.invoke(
        { input: "What am I building?" },
        { configurable: { sessionId: "session_01" } }
    );
    console.log(response.content); // Output: "You are building a Web OS."
}