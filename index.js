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

app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Verificar se os campos foram enviados
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    const users = loadUsers();
  
    // Encontrar o usuário com base no username e password
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  
    // Retornar a mensagem do usuário se o login for bem-sucedido
    return res.status(200).json({ message: user.message });
  });

  app.put('/update-message', (req, res) => {
    const { password, message } = req.body;
  
    // Verifica se os campos necessários foram enviados
    if (!password || !message) {
      return res.status(400).json({ message: 'Password and message are required' });
    }
  
    const users = loadUsers();
  
    // Procura o usuário com a senha fornecida
    const userIndex = users.findIndex((user) => user.password === password);
  
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Atualiza a mensagem do usuário
    users[userIndex].message = message;
  
    // Salva as alterações no arquivo JSON
    saveUsers(users);
  
    return res.status(200).json({
      message: 'Message updated successfully',
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        message: users[userIndex].message,
      },
    });
  });
  
module.exports = app;
