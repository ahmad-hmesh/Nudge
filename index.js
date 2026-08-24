const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

const columns = db.prepare("PRAGMA table_info(tasks)").all();

const hasDueDate = columns.some(col => col.name === 'due_date');
if (!hasDueDate) {
  db.exec('ALTER TABLE tasks ADD COLUMN due_date TEXT');
}

const hasPriority = columns.some(col => col.name === 'priority');
if (!hasPriority) {
  db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'");
}

const hasCategory = columns.some(col => col.name === 'category');
if (!hasCategory) {
  db.exec('ALTER TABLE tasks ADD COLUMN category TEXT');
}

const hasRemindTime = columns.some(col => col.name === 'remind_time');
if (!hasRemindTime) {
  db.exec("ALTER TABLE tasks ADD COLUMN remind_time TEXT NOT NULL DEFAULT '13:00'");
}

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.static('public'));

const validPriorities = ['low', 'medium', 'high'];
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

app.get('/', (req, res) => {
  res.send('Hello from your To-Do API!');
});

app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const title = req.body.title;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  const dueDate = req.body.due_date || null;

  let priority = req.body.priority || 'medium';
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be low, medium, or high' });
  }

  let category = null;
  if (req.body.category !== undefined && req.body.category !== null) {
    if (typeof req.body.category !== 'string' || req.body.category.trim().length > 50) {
      return res.status(400).json({ error: 'Category must be a string under 50 characters' });
    }
    category = req.body.category.trim() || null;
  }

  let remindTime = req.body.remind_time || '13:00';
  if (!timePattern.test(remindTime)) {
    return res.status(400).json({ error: 'remind_time must be in HH:MM 24-hour format' });
  }

  const stmt = db.prepare('INSERT INTO tasks (title, done, due_date, priority, category, remind_time) VALUES (?, 0, ?, ?, ?, ?)');
  const result = stmt.run(title.trim(), dueDate, priority, category, remindTime);
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  let title = task.title;
  let done = task.done;
  let dueDate = task.due_date;
  let priority = task.priority;
  let category = task.category;
  let remindTime = task.remind_time;

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    title = req.body.title.trim();
  }

  if (req.body.done !== undefined) {
    if (typeof req.body.done !== 'boolean') {
      return res.status(400).json({ error: 'Done must be true or false' });
    }
    done = req.body.done ? 1 : 0;
  }

  if (req.body.due_date !== undefined) {
    dueDate = req.body.due_date;
  }

  if (req.body.priority !== undefined) {
    if (!validPriorities.includes(req.body.priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }
    priority = req.body.priority;
  }

  if (req.body.category !== undefined) {
    if (req.body.category !== null && (typeof req.body.category !== 'string' || req.body.category.trim().length > 50)) {
      return res.status(400).json({ error: 'Category must be a string under 50 characters' });
    }
    category = req.body.category === null ? null : req.body.category.trim() || null;
  }

  if (req.body.remind_time !== undefined) {
    if (!timePattern.test(req.body.remind_time)) {
      return res.status(400).json({ error: 'remind_time must be in HH:MM 24-hour format' });
    }
    remindTime = req.body.remind_time;
  }

  db.prepare('UPDATE tasks SET title = ?, done = ?, due_date = ?, priority = ?, category = ?, remind_time = ? WHERE id = ?')
    .run(title, done, dueDate, priority, category, remindTime, taskId);
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  res.json(updatedTask);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(204).send();
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});