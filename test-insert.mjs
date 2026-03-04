import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'test'
});

try {
  const result = await connection.execute(
    `INSERT INTO gotStrategies (name, attackFormation1, attackFormation2, attackFormation3, defenseFormation1, defenseFormation2, defenseFormation3, createdBy, usageCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Test Strategy', 'Ataque1', 'Ataque2', 'Ataque3', 'Defesa1', 'Defesa2', 'Defesa3', 1, 0]
  );
  console.log('Insert result:', result);
} catch (error) {
  console.error('Insert error:', error);
}

await connection.end();
