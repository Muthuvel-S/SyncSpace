const taskAssignedEmail = ({ userName, taskTitle, workspaceName }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Task Assigned</title>
</head>

<body style="margin:0; padding:0; background-color:#eef2f7; font-family:Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 15px;">

      <!-- Main Card -->
      <table width="100%" style="max-width:600px; background:#ffffff; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,0.08); overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:28px; text-align:center; background:#f8fafc;">
            <h1 style="margin:0; font-size:28px; font-weight:bold; letter-spacing:-0.5px;">
              <span style="color:#4f46e5;">Sync</span><span style="color:#111827;">Space</span>
            </h1>
            <p style="margin-top:6px;  color:#6b7280; font-size:14px;">
              Workspace Notification
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:34px;">
            <h2 style="color:#111827; margin-bottom:10px;">
              Hello ${userName} 👋
            </h2>

            <p style="color:#4b5563; font-size:15px; line-height:1.7;">
              You have been assigned a new task in the workspace:
            </p>

            <!-- Workspace Badge -->
            <div style="
              display:inline-block;
              margin:10px 0 18px;
              padding:6px 14px;
              background:#eef2ff;
              color:#4f46e5;
              font-size:13px;
              border-radius:20px;
              font-weight:bold;
            ">
              📁 ${workspaceName}
            </div>

            <!-- Task Card -->
            <div style="
              margin:20px 0;
              padding:18px;
              background:#f8fafc;
              border-left:6px solid #4f46e5;
              border-radius:8px;
            ">
              <p style="margin:0; font-size:16px; color:#111827;">
                <strong>📌 Task:</strong> ${taskTitle}
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align:center; margin:34px 0;">
              <a href="${process.env.FRONTEND_URL}" 
                 style="
                  background:#4f46e5;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 38px;
                  border-radius:30px;
                  font-weight:bold;
                  font-size:15px;
                  display:inline-block;
                 ">
                Open SyncSpace
              </a>
            </div>

            <p style="color:#6b7280; font-size:14px;">
              Log in to <strong>SyncSpace</strong> to view task details and update its progress.
            </p>

            <p style="margin-top:30px; color:#6b7280; font-size:14px;">
              — SyncSpace Team
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9; padding:18px; text-align:center; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} SyncSpace · Built for collaboration
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
  `;
};

export default taskAssignedEmail;
