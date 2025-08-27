"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: '.env' });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const supabase_js_1 = require("@supabase/supabase-js");
const node_fetch_1 = __importDefault(require("node-fetch"));
const generative_ai_1 = require("@google/generative-ai");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const connection = new ioredis_1.default(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
const genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
// Function to parse PDF/text content
async function parseFileContent(fileBuffer, fileType) {
    if (fileType === 'pdf') {
        const data = await (0, pdf_parse_1.default)(fileBuffer);
        return data.text;
    }
    else if (fileType === 'docx') {
        const { value } = await mammoth_1.default.extractRawText({ buffer: fileBuffer });
        return value;
    }
    else if (fileType === 'txt' || fileType === 'md' || fileType === 'csv') {
        return fileBuffer.toString('utf8');
    }
    else {
        return '';
    }
}
const worker = new bullmq_1.Worker('aiProcessQueue', async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    const { fileId, filePath, fileType } = job.data;
    // 1. Download file from Supabase Storage
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
        .from('files')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour
    if (signedUrlError) {
        throw new Error(`Error creating signed URL: ${signedUrlError.message}`);
    }
    const response = await (0, node_fetch_1.default)(signedUrlData.signedUrl);
    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const fileBuffer = await response.buffer();
    console.log(`Downloaded file ${filePath} with size ${fileBuffer.length} bytes.`);
    // 2. Run AI analysis (Google Vision for images, Gemini for text/PDFs)
    let tags = [];
    let summary = null;
    let keywords = [];
    const mimeType = response.headers.get('content-type');
    console.log(`Detected MIME type: ${mimeType}`);
    // if (mimeType?.startsWith('image/')) {
    //   // Google Vision for images
    //   const [result] = await visionClient.labelDetection(fileBuffer);
    //   const labels = result.labelAnnotations;
    //   if (labels) {
    //     tags = labels.map(label => label.description!).filter(Boolean) as string[];
    //   }
    //   console.log(`Image analysis for ${filePath}: Tags - ${tags.join(', ')}`);
    // } 
    if (mimeType?.startsWith('application/pdf') || mimeType?.startsWith('text/') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Gemini for PDFs/Text
        const fileContent = await parseFileContent(fileBuffer, fileType);
        console.log("Parsed file content length:", fileContent.length);
        if (fileContent) {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(`Please provide a concise summary under 50 words and up to 5 keywords for the following document:\n\n${fileContent}`);
            console.log("Gemini API result:", JSON.stringify(result, null, 2));
            const aiResponse = await result?.response.text();
            if (aiResponse) {
                console.log("AI Response received, length:", aiResponse.length);
                // Attempt to parse summary and keywords from AI response
                const summaryMatch = aiResponse.match(/Summary:\s*([\s\S]+?)(?:\nKeywords:|$)/i);
                const keywordsMatch = aiResponse.match(/Keywords:\s*([\s\S]+)/i);
                if (summaryMatch && summaryMatch[1]) {
                    summary = summaryMatch[1].trim();
                }
                if (keywordsMatch && keywordsMatch[1]) {
                    keywords = keywordsMatch[1].split(',').map(kw => kw.trim()).filter(Boolean);
                }
            }
            console.log(`Text analysis for ${filePath}: Summary - ${summary}, Keywords - ${keywords.join(', ')}`);
        }
    }
    // 3. Update metadata in Postgres
    const { error: updateError } = await supabaseAdmin
        .from('files')
        .update({
        status: 'ready',
        tags: tags,
        summary: summary,
        keywords: keywords,
        processed_at: new Date().toISOString(),
    })
        .eq('id', fileId);
    if (updateError) {
        console.error(`Error updating file ${fileId} metadata:`, updateError);
    }
    console.log(`Job ${job.id} completed.`);
}, {
    connection
});
worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});
worker.on('failed', (job, err) => {
    console.log(`Job has failed with error ${err.message}`);
});
console.log("AI Processing Worker started.");
