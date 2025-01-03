const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

app.use(express.json());  // Permitir o corpo da requisição em formato JSON

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

// Rota para adicionar um novo usuário com mensagem
app.post('/add-user', (req, res) => {
  const { username, password, message } = req.body;

  // Verifica se os campos obrigatórios existem
  if (!username || !password || !message) {
    return res.status(400).json({ message: 'Username, password and message are required' });
  }

  const users = loadUsers();

  // Verifica se o usuário já existe
  const userExists = users.find((user) => user.username === username);
  
  if (userExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Adiciona o novo usuário ao array
  const newUser = {
    id: users.length + 1, // Gerar um ID único
    username,
    password,
    message // Armazena a mensagem personalizada do usuário
  };
  
  users.push(newUser);
  
  // Salva os usuários no arquivo
  saveUsers(users);

  return res.status(201).json({ message: 'User added successfully', userId: newUser.id });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
