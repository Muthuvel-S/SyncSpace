import Task from "../models/Task.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import sendEmail from "../utils/sendEmail.js";
import taskAssignedEmail from "../utils/taskAssignedEmail.js";

export const createTask = async (req, res) => {
  try {
    const { title, workspaceId, assignedTo } = req.body;

    const task = await Task.create({
      title,
      workspaceId,
      assignedTo,
      createdBy: req.user.id,
    });

    // 🔍 Get workspace name
    const workspace = await Workspace.findById(workspaceId);

    // 🔔 Send Emails
    if (assignedTo && assignedTo.length > 0) {
      const users = await User.find({ _id: { $in: assignedTo } });

      for (const user of users) {
        await sendEmail({
          to: user.email,
          subject: "📌 New Task Assigned - SyncSpace",
          html: taskAssignedEmail({
            userName: user.name || "Member",
            taskTitle: title,
            workspaceName: workspace?.name || "Workspace",
          }),
        });
      }
    }

    // 🔴 Real-time socket
    req.io.to(workspaceId).emit("task_created", task);

    res.status(201).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Task creation failed" });
  }
};