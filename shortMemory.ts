import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
// import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";

// Initialize local model
const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama3.2:1b",
});

// new ChatOllama({baseUrl : string, model : string})

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful AI terminal assistant."],
    new MessagesPlaceholder("chat_history"), // Memory gets injected right here!
    ["user", "{input}"],
]);
    
// ChatPromptTemplate.fromMessages([["role", "prompts"], new MessagesPlaceholder("chat_history"), ["user", "{input}"]])
// new MessagesPlaceholder("chat_history"), -> memory was injected here


// prompt.pipe(model) -> prompts will be pipe to model that contains host url and model
const chain = prompt.pipe(model);   

// Create an in-memory database to store the conversation
const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

//  Wrap  chain with the memory manager
// new RunnableWithMessageHistory({runnable : chain, getMessageHistory() : async() => {}, inputMessagesKey : "input", historyMesagesKey : "chat_history"}) -> returns promise
const agentWithMemory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async (sessionId) => {
        if (!messageHistories[sessionId]) {
            messageHistories[sessionId] = new InMemoryChatMessageHistory(); // -> from chat message history package
        }
        return messageHistories[sessionId];
    },
    inputMessagesKey: "input", 
    historyMessagesKey: "chat_history",
});

//  Execution Example 
async function runSession() {
    // First message
    await agentWithMemory.invoke(
        { input: "Hi, I am building a Web OS." },
        { configurable: { sessionId: "session_01" } } // The unique ID for this thread
    ); // await running asyn    c

    // Second message: The model will remember the first one!
    const response = await agentWithMemory.invoke(
        { input: "What am I building?" },
        { configurable: { sessionId: "session_01" } }
    );

    // if(typeof response === "object" && response !== null ){ // type guard for response
    console.log(response?.content); // "You are building a Web OS."

    // }
}

(async () => {
    try {
        await runSession();
    } catch (error) {
        console.error("Error running semantic memory:", error);
    }
})();