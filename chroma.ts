import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
});

async function runChromaMemory() {
    // 1. Connect to the Docker container
    const vectorStore = new Chroma(embeddings, {
        collectionName: "web_os_configs",
        url: "http://localhost:8000", 
    });

    // 2. Add some "Permanent" memories
    const docs = [
        new Document({
            pageContent: "MY secret access code is 070104 means my birtday",
            metadata: { source: "ui_specs.txt" }
        }),
        new Document({
            pageContent: "Current project directory is C:/LangChain/lang",
            metadata: { source: "env_vars" }
        })
    ]

    await vectorStore.addDocuments(docs);
    console.log("Memory persisted to ChromaDB via Docker!");

    // 3. Query the database
    const query = "Personality contents";
    const results = await vectorStore.similaritySearch(query, 1);

    console.log(`\n[Retrieved Memory]: ${results[0].pageContent}`);
}




// test case after the data was saved to chromaDB
async function peekInsideChroma() {
    const vectorStore = new Chroma(embeddings, {
        collectionName: "web_os_configs",
        url: "http://localhost:8000",
    });

    const collection = await vectorStore.ensureCollection();
    // .get() with no arguments fetches the first 10 by default
    // include: ["documents", "metadatas"] ensures you see the text!
    const allData = await collection.get({
        limit: 100,
        include: ["documents" as any, "metadatas" as any] 
    });

    console.log("--- ALL STORED MEMORIES ---");


    if (!allData || allData.documents.length === 0) {
        console.log("--- DATABASE IS EMPTY ---");
        console.log("Tip: Uncomment 'await runChromaMemory()' to add data first.");
    } else {
        console.log(`--- FOUND ${allData.documents.length} MEMORIES ---`);
        allData.documents.forEach((doc, i) => {
            console.log(`[${i}] Text: ${doc}`);
            console.log(`    Metadata: ${JSON.stringify(allData.metadatas?.[i])}`);
        });
    }
}



(async () => {
    // await runChromaMemory();
    await peekInsideChroma();
})();