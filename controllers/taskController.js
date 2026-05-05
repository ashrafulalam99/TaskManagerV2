import db from "../db.js";

export const createTask = (req, res) => {
  const { title, description, status, priority } = req.body;

  const userId = req.user.id;

  db.query(
    "INSERT INTO tasks (title, description, status, priority, user_id) VALUES (?, ?, ?, ?, ?)",
    [title, description, status, priority, userId],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.status(201).json({ message: "Task created" });
    }
  );
};

export const getAllTasks = (req, res) => {
  const userId = req.user.id;

  const { status, priority, search } = req.query;

  let query = "SELECT * FROM tasks WHERE user_id = ?";
  let params = [userId];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  if (priority) {
    query += " AND priority = ?";
    params.push(priority);
  }

  if (search) {
    query += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    res.json(result);
  });
};

export const getTaskById = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  db.query(
    "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
    [taskId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(result[0]);
    }
  );
};

export const updateTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, description, status, priority } = req.body;

  let updateFields = [];
  let queryParams = [];

  if (title !== undefined) {
    updateFields.push("title = ?");
    queryParams.push(title);
  }
  if (description !== undefined) {
    updateFields.push("description = ?");
    queryParams.push(description);
  }
  if (status !== undefined) {
    updateFields.push("status = ?");
    queryParams.push(status);
  }
  if (priority !== undefined) {
    updateFields.push("priority = ?");
    queryParams.push(priority);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  queryParams.push(taskId, userId);

  const query = `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`;

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated" });
  });
};

export const deleteTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  db.query(
    "DELETE FROM tasks WHERE id=? AND user_id=?",
    [taskId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json({ message: "Task deleted" });
    }
  );
};