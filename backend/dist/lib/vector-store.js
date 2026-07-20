"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVectorDb = getVectorDb;
exports.getChunksTable = getChunksTable;
exports.createKnowledgeIndex = createKnowledgeIndex;
exports.searchKnowledge = searchKnowledge;
const lancedb = __importStar(require("@lancedb/lancedb"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Define where LanceDB stores its data.
// It will use LANCEDB_PATH from env, or default to a local '.lancedb' folder.
const dbPath = process.env.LANCEDB_PATH || path_1.default.resolve(process.cwd(), '.lancedb');
let db = null;
/**
 * Ensures the LanceDB directory exists and opens the connection.
 */
async function getVectorDb() {
    if (db)
        return db;
    if (!fs_1.default.existsSync(dbPath)) {
        fs_1.default.mkdirSync(dbPath, { recursive: true });
    }
    db = await lancedb.connect(dbPath);
    return db;
}
/**
 * Gets or creates the knowledge chunks table in LanceDB.
 * We store embedding (vector), chunkId, documentId, documentVersion, and chunk content.
 */
async function getChunksTable() {
    const conn = await getVectorDb();
    const tableName = 'knowledge_chunks';
    // Note: We create the table dynamically when inserting the first records.
    // If it exists, we just open it.
    const tableNames = await conn.tableNames();
    if (tableNames.includes(tableName)) {
        return await conn.openTable(tableName);
    }
    return null;
}
/**
 * Inserts or replaces chunks in LanceDB.
 * Reindexing creates a new table or overwrites it if we pass a new table name,
 * but for simplicity, we can just delete old versions or overwrite.
 * The user requested: "Reindexing builds a new index before activating it. A failed reindex must not destroy the previous working index."
 * We will achieve this by creating a table named `knowledge_chunks_${version}`.
 */
async function createKnowledgeIndex(version, chunks) {
    const conn = await getVectorDb();
    const tableName = `knowledge_chunks_${version.replace(/[^a-zA-Z0-9]/g, '_')}`;
    // If it already exists, drop it to rebuild
    const tableNames = await conn.tableNames();
    if (tableNames.includes(tableName)) {
        await conn.dropTable(tableName);
    }
    await conn.createTable(tableName, chunks);
    return tableName;
}
/**
 * Perform similarity search on a specific version table.
 */
async function searchKnowledge(version, queryVector, limit = 5) {
    const conn = await getVectorDb();
    const tableName = `knowledge_chunks_${version.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const tableNames = await conn.tableNames();
    if (!tableNames.includes(tableName)) {
        return [];
    }
    const table = await conn.openTable(tableName);
    // LanceDB uses L2 distance by default.
    // We can convert this to a relevance score (e.g. cosine similarity equivalent or normalized distance).
    const results = await table.search(queryVector).limit(limit).toArray();
    return results.map((r) => {
        // Normalise distance to a relevance score (heuristic: 1 / (1 + distance), or similar)
        // You should calibrate this based on the specific embedding model.
        // Nomic-embed-text generates normalized vectors, so L2 distance relates to cosine similarity.
        // Score = 1 - (distance / 2) roughly for normalized vectors.
        const rawDistance = r._distance || 0;
        const normalisedRelevance = Math.max(0, 1 - (rawDistance / 2));
        return {
            chunkId: r.chunkId,
            documentId: r.documentId,
            content: r.content,
            rawDistance,
            normalisedRelevance
        };
    });
}
