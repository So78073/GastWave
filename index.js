const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

app.use(express.json()); // Permitir o corpo da requisição em formato JSON

const usersFilePath = path.join(__dirname, 'user.json');

// Função para carregar os usuários
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao carregar o arquivo user.json:', err);
    return [];
  }
};

// Função para salvar os usuários no arquivo
const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao salvar o arquivo user.json:', err);
  }
};

// Rota para registrar um novo usuário
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = loadUsers();

  // Verifica se o usuário já existe
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Adiciona o novo usuário
  const newUser = {
    id: users.length + 1, // Gerar um ID único
    username,
    password,
    messages: [], // Array para armazenar mensagens
  };

  users.push(newUser);
  saveUsers(users);

  return res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

// Rota para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = loadUsers();
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  return res.status(200).json({ message: 'Login successful', user });
});

// Rota para adicionar uma mensagem
app.post('/add-message', (req, res) => {
  const { username, password, message } = req.body;

  if (!username || !password || !message) {
    return res.status(400).json({ message: 'Username, password, and message are required' });
  }

  const users = loadUsers();
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Adiciona a nova mensagem com data e hora
  user.messages.push({
    date: new Date().toISOString(),
    message,
  });

  saveUsers(users);

  return res.status(200).json({ message: 'Message added successfully', messages: user.messages });
});

// Rota para listar as mensagens de um usuário
app.get('/get-messages', (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = loadUsers();
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  return res.status(200).json({ messages: user.messages });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
