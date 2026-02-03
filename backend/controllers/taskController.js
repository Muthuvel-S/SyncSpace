import Task from "../models/Task.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const createTask = async (req, res) => {
  try {
    const { title, workspaceId, assignedTo } = req.body;

    const task = await Task.create({
      title,
      workspaceId,
      assignedTo,
      createdBy: req.user.id
    });

    // 🔔 EMAIL NOTIFICATION LOGIC
    if (assignedTo && assignedTo.length > 0) {
      const users = await User.find({ _id: { $in: assignedTo } });

      for (const user of users) {
        await sendEmail({
          to: user.email,
          subject: "📌 New Task Assigned - SyncSpace",
          html: `
            <h3>Hello ${user.name || "Member"},</h3>
            <p>You have been assigned a new task:</p>
            <p><b>${title}</b></p>
            <p>Please login to SyncSpace to view details.</p>
            <br />
            <p>— SyncSpace Team</p>
          `
        });
      }
    }

    // Socket event (you already use this)
    req.io.to(workspaceId).emit("task_created", task);

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Task creation failed" });
  }
};
