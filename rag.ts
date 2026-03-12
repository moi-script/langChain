import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { ChatOllama } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// Setup
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });
const model = new ChatOllama({ model: "llama3.2:1b", temperature: 0 });

async function testRAGSystem() {
    console.log("--- STARTING RAG TEST CASE ---");

    // Initialize DB
    const vectorStore = new Chroma(embeddings, {
        collectionName: "web_os_test",
        url: "http://localhost:8000",
    });

    // DATA INGESTION: Save a specific fact
    const testSecret = "The user's secret access code for the Web OS is 'MOI-2026'.";
    await vectorStore.addDocuments([
        new Document({ pageContent: testSecret, metadata: { type: "security" } })
    ]);
    console.log(" Step 1: Fact successfully saved to ChromaDB.");

    // RETRIEVAL: Search for the fact
    const query = "What is my access code?";
    const contextDocs = await vectorStore.similaritySearch(query, 1);
    const context = contextDocs[0]?.pageContent || "No context found.";
    console.log(` Step 2: Context retrieved: "${context.substring(0, 30)}..."`);

    // GENERATION: Ask the LLM to answer using the retrieved context
    const prompt = PromptTemplate.fromTemplate(`
        Answer the question based ONLY on the following context:
        {context}

        Question: {question}
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({ context, question: query });

    console.log(`Step 3: AI Final Answer: ${response}`);

    //  VALIDATION
    if (response.includes("MOI-2026")) {
        console.log("\n🔥 TEST PASSED: The AI successfully retrieved and used the data!");
    } else {
        console.log("\n❌ TEST FAILED: The AI did not find the correct secret.");
    }
}

(async () => {
    await testRAGSystem();
})();