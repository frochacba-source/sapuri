import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'iupey3eywt3enlkjwyfo6f',
});

const strategies = [
  {
    name: 'Estratégia 1',
    attackFormation1: 'Kanon',
    attackFormation2: 'Ikki',
    attackFormation3: 'ShunD',
    defenseFormation1: 'Defesa',
    defenseFormation2: 'Taça',
    defenseFormation3: 'CamusD',
    observation: 'Estratégia de ataque com Kanon, Ikki e ShunD',
    usageCount: 5,
  },
  {
    name: 'Estratégia 2',
    attackFormation1: 'Ataque',
    attackFormation2: 'Defesa',
    attackFormation3: 'Kanon',
    defenseFormation1: 'Ikki',
    defenseFormation2: 'Shijima',
    defenseFormation3: 'Taça',
    observation: 'Estratégia com Ikki na defesa',
    usageCount: 3,
  },
  {
    name: 'Estratégia 3',
    attackFormation1: 'Ataque',
    attackFormation2: 'Defesa',
    attackFormation3: 'Ikki',
    defenseFormation1: 'Defesa',
    defenseFormation2: 'MuD',
    defenseFormation3: 'Taça',
    observation: 'Estratégia com Ikki no ataque',
    usageCount: 2,
  },
  {
    name: 'Estratégia 4',
    attackFormation1: 'Kanon',
    attackFormation2: 'Ikki',
    attackFormation3: 'MuD',
    defenseFormation1: 'Ikki',
    defenseFormation2: 'SeyiaD',
    defenseFormation3: 'MiloD',
    observation: 'Estratégia balanceada',
    usageCount: 4,
  },
  {
    name: 'Estratégia 5',
    attackFormation1: 'ShunD',
    attackFormation2: 'Bonzeta',
    attackFormation3: 'Atena',
    defenseFormation1: 'Defesa',
    defenseFormation2: 'Ikki',
    defenseFormation3: 'Shijima',
    observation: 'Estratégia com Shun no ataque',
    usageCount: 1,
  },
];

try {
  for (const strategy of strategies) {
    await connection.execute(
      `INSERT INTO gotStrategies (name, attackFormation1, attackFormation2, attackFormation3, defenseFormation1, defenseFormation2, defenseFormation3, observation, usageCount, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        strategy.name,
        strategy.attackFormation1,
        strategy.attackFormation2,
        strategy.attackFormation3,
        strategy.defenseFormation1,
        strategy.defenseFormation2,
        strategy.defenseFormation3,
        strategy.observation,
        strategy.usageCount,
      ]
    );
  }
  console.log('✅ Estratégias inseridas com sucesso!');
} catch (error) {
  console.error('❌ Erro ao inserir estratégias:', error);
} finally {
  await connection.end();
}
