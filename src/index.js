const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({
      error: "User not found"
    })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some((user) => user.username === username);

  if(usernameAlreadyExists) {
    return response.status(400).json({
      error: 'Username already exists!'
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  
  users.push(user);
  
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const saveTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(saveTodo);

  return response.status(201).json(saveTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const index = user.todos.findIndex(todo => todo.id === id);

  if(index < 0) {
    return response.status(404).json({error: 'Todo does not exists'});
  }

  user.todos[index].title = title;
  user.todos[index].deadline = deadline;

  return response.json(user.todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex(todo => todo.id === id);

  if(index < 0) {
    return response.status(404).json({ error: 'Todo does not exists'});
  }

  user.todos[index].done = true;

  return response.json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyTodo = user.todos.some(todo => todo.id === id);

  if(!verifyTodo) {
    return response.status(404).json({ error: 'Todo does not exists'});
  }

  const todo = user.todos.filter(todo => todo.id !== id);

  user.todos = todo;

  return response.status(204).send();
});

module.exports = app;