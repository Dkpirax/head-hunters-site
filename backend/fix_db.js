const mysql = require('mysql2/promise');
mysql.createConnection('mysql://root:@localhost:3306/headhunters').then(c => 
  c.query("UPDATE Conversation SET mode = 'AI', chatStatus = 'OPEN' WHERE status = 'CLOSED' AND mode = 'HUMAN'")
    .then(([r]) => console.log('Fixed', r.affectedRows, 'conversations'))
    .catch(console.error)
    .finally(() => c.end())
);
