import Task from "../models/Task.js";
import { getIO } from "../sockets/socket.js";

// @desc    Get all tasks (with location filtering)
// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    // Show all non-completed tasks (both open and claimed)
    let query = { status: { $ne: "completed" } };

    // Add location filtering if needed
    if (req.query.longitude && req.query.latitude) {
      query.location = { /* your location query */ };
    }

    const tasks = await Task.find(query)
      .populate("requester", "name email phone")
      .populate("helper", "name email phone")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, category, location, deadline } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const task = await Task.create({
      title,
      description,
      category,
      location,
      deadline,
      requester: req.user.id,
      createdBy: req.user.id,
      status: "open",
    });

    const populatedTask = await Task.findById(task._id).populate(
      "requester",
      "name"
    );

    const io = getIO();
    io.emit("new-task", populatedTask);

    res.status(201).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const { title, description, category, location, deadline } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Only the task requester can update the task
    if (task.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this task",
      });
    }

    // Cannot update claimed or completed tasks
    if (task.status !== "open") {
      return res.status(400).json({
        success: false,
        error: "Only open tasks can be updated",
      });
    }

    // Update task fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category || task.category;
    task.location = location || task.location;
    task.deadline = deadline || task.deadline;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id)
      .populate("requester", "name email")
      .populate("helper", "name email")
      .populate("createdBy", "name");

    const io = getIO();
    io.emit("task-updated", populatedTask);

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Claim a task
// @route   PUT /api/tasks/:id/claim
export const claimTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("requester", "name")
      .populate("helper", "name")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    if (task.status !== "open") {
      return res.status(400).json({
        success: false,
        error: "Task already claimed/completed",
      });
    }

    // Prevent users from claiming their own tasks
    if (task.requester?._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot claim your own task",
      });
    }

    task.helper = req.user.id;
    task.status = "claimed";
    const updatedTask = await task.save();

    const io = getIO();
    io.emit("task-claimed", updatedTask);

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Complete a task
// @route   PUT /api/tasks/:id/complete
export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("requester", "name")
      .populate("helper", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Only the task requester or helper can mark as complete
    if (
      task.requester._id.toString() !== req.user.id &&
      task.helper?._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to complete this task",
      });
    }

    task.status = "completed";
    const updatedTask = await task.save();

    const io = getIO();
    io.emit("task-completed", updatedTask);

    res.status(200).json({ success: true, data: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user's tasks
// @route   GET /api/tasks/my-tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ requester: req.user.id }, { helper: req.user.id }],
    })
      .populate("requester", "name email")
      .populate("helper", "name email")
      .populate("createdBy", "name");

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Only allow deletion by task creator
    if (task.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this task",
      });
    }

    await task.remove();

    const io = getIO();
    io.emit("task-deleted", task._id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};