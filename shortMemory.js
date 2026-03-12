"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ollama_1 = require("@langchain/ollama");
var prompts_1 = require("@langchain/core/prompts");
var runnables_1 = require("@langchain/core/runnables");
// import { ChatMessageHistory } from "langchain/stores/message/in_memory";
var chat_history_1 = require("@langchain/core/chat_history");
// Initialize local model
var model = new ollama_1.ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama3.2:1b",
});
// new ChatOllama({baseUrl : string, model : string})
var prompt = prompts_1.ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful AI terminal assistant."],
    new prompts_1.MessagesPlaceholder("chat_history"), // Memory gets injected right here!
    ["user", "{input}"],
]);
// ChatPromptTemplate.fromMessages([["role", "prompts"], new MessagesPlaceholder("chat_history"), ["user", "{input}"]])
// new MessagesPlaceholder("chat_history"), -> memory was injected here
// prompt.pipe(model) -> prompts will be pipe to model that contains host url and model
var chain = prompt.pipe(model);
// Create an in-memory database to store the conversation
var messageHistories = {};
//  Wrap  chain with the memory manager
// new RunnableWithMessageHistory({runnable : chain, getMessageHistory() : async() => {}, inputMessagesKey : "input", historyMesagesKey : "chat_history"}) -> returns promise
var agentWithMemory = new runnables_1.RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!messageHistories[sessionId]) {
                messageHistories[sessionId] = new chat_history_1.InMemoryChatMessageHistory(); // -> from chat message history package
            }
            return [2 /*return*/, messageHistories[sessionId]];
        });
    }); },
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});
//  Execution Example 
function runSession() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // First message
                return [4 /*yield*/, agentWithMemory.invoke({ input: "Hi, I am building a Web OS." }, { configurable: { sessionId: "session_01" } } // The unique ID for this thread
                    )];
                case 1:
                    // First message
                    _a.sent(); // await running async
                    return [4 /*yield*/, agentWithMemory.invoke({ input: "What am I building?" }, { configurable: { sessionId: "session_01" } })];
                case 2:
                    response = _a.sent();
                    // if(typeof response === "object" && response !== null ){ // type guard for response
                    console.log(response); // "You are building a Web OS."
                    return [2 /*return*/];
            }
        });
    });
}
await runSession();
