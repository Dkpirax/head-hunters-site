const mysql = require('mysql2/promise');
mysql.createConnection('mysql://root:@localhost:3306/headhunters').then(c => 
  Promise.all([
    c.query(`CREATE TABLE IF NOT EXISTS KnowledgeDocument (id VARCHAR(191) PRIMARY KEY, title VARCHAR(191) NOT NULL, fileName VARCHAR(191) NOT NULL, version VARCHAR(191) NOT NULL, status VARCHAR(191) NOT NULL, checksum VARCHAR(191) NOT NULL, uploadedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, uploadedBy VARCHAR(191), indexedAt TIMESTAMP NULL DEFAULT NULL)`),
    c.query(`CREATE TABLE IF NOT EXISTS KnowledgeChunk (id VARCHAR(191) PRIMARY KEY, documentId VARCHAR(191) NOT NULL, documentVersion VARCHAR(191) NOT NULL, sectionTitle VARCHAR(191), pageNumber INT, chunkIndex INT NOT NULL, contentHash VARCHAR(191) NOT NULL, tokenCount INT NOT NULL, vectorRecordId VARCHAR(191) NOT NULL, status VARCHAR(191) NOT NULL DEFAULT 'ACTIVE', createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX knowledge_chunk_document_id_idx (documentId), INDEX knowledge_chunk_vector_record_id_idx (vectorRecordId))`)
  ]).then(() => console.log('success')).catch(console.error).finally(() => c.end())
);
