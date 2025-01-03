const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware para parsing de JSON no body
app.use(express.json());

// Caminho do arquivo user.json
const usersFilePath = path.join(__dirname, 'user.json');

// Função para carregar usuários
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao carregar o arquivo user.json:', err);
    return [];
  }
};

// Rota principal
app.get('/', (req, res) => {
  res.status(200).json('Welcome, your app is working well - a');
});

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = loadUsers();
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    return res.status(200).json({ message: 'Login successful', userId: user.id });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Inicializa o servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
