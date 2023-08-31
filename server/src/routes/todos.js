const express = require('express');
const routes = express.Router();
const Todo = require('../models/Todo');

routes.get('/api/todos', async (req, res) => {
  const userId = req.auth.sub;
  const todos = await Todo.find({ user: userId });
  res.json([todos]);
});

routes.put('/api/todos/:id', async (req, res) => {
  const userId = req.auth.sub;
  const todoData = req.body;
  const id = req.params.id;

    try {
      const todo = await Todo.findById(id);
      if (todo.user.toString() == userId) {
        return res
          .status(401)
          .json({ error: 'You are not allowed to edit this item' });
      }

      if (!todo) {
        return res.status(401).json({ error: 'Item not found' });
      }
      // we are not allowing the user to change the other properties.
      todo.text = todoData.text || todo.text;
      todo.done = todoData.done || todo.done;

      await todo.save();

      res.status(200).json({ message: 'Item updated successfully', todo });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Internal Server Error while updating event' });
    }
});

routes.delete('/api/todos/:id', async (req, res) => {
  const { userId } = req.auth.sub;
  const id = req.params.id;

    try {
      const todo = await Todo.findById(id);
      if (todo.user.toString() != userId) {
        return res.status(403).json({
          error: 'You are not allowed to delete this item',
        });
      }

      if (!todo) {
        return res.status(404).json({ error: 'Item not found' });
      }

      await Todo.findByIdAndDelete(id);
      res.status(204).json({ message: 'Item deleted successfully' });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Internal Server Error while deleting item' });
    }
});

routes.post('/',async (req, res) => {
  const userId = req.auth.sub;
  try {
    const todo = await Todo.create({
      text: req.body.text,
      done: false,
      user: userId,
    });

    res.status(204).json(todo); // Success status code 201 - Created
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error while creating item'); // Failure status code 500
  }
});

module.exports = routes;
