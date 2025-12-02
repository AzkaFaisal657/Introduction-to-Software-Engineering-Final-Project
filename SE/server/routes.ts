import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Simple email sender using Resend API
async function sendEmailViaResend(
  to: string,
  subject: string,
  type: string,
  data: any,
) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("Email not sent: RESEND_API_KEY not configured");
    return false;
  }

  let htmlContent = "";

  if (type === "critical-attendance") {
    htmlContent = `
      <h2>Critical Attendance Alert</h2>
      <p>Dear ${data.studentName},</p>
      <p>Your attendance in <strong>${data.courseName}</strong> has dropped to <strong>${data.attendance}%</strong>.</p>
      <p>This is below the minimum required 80%. <strong>Please attend classes immediately.</strong></p>
      <p>If you have any questions, contact your teacher or the administration office.</p>
      <hr>
      <p style="color: #999; font-size: 12px;">AMAL-NAMA - Student Attendance & Result Management System</p>
    `;
  } else if (type === "grade-notification") {
    htmlContent = `
      <h2>New Grade Posted</h2>
      <p>Dear ${data.studentName},</p>
      <p>Your grade for <strong>${data.assessmentType}</strong> in ${data.courseName} has been posted.</p>
      <p><strong>Marks: ${data.obtainedMarks}/${data.maxMarks}</strong> (${data.percentage.toFixed(1)}%)</p>
      <p>Log in to your AMAL-NAMA account to see detailed feedback.</p>
      <hr>
      <p style="color: #999; font-size: 12px;">AMAL-NAMA - Student Attendance & Result Management System</p>
    `;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AMAL-NAMA <onboarding@resend.dev>",
        to,
        subject,
        html: htmlContent,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get("/api/debug", (_req, res) => {
    const apiKey = process.env.RESEND_API_KEY;
    res.json({
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : "NOT SET",
    });
  });

  app.get("/api/test-email", async (_req, res) => {
    console.log("🧪 TEST EMAIL ENDPOINT CALLED");
    const result = await sendEmailViaResend(
      "azkahaq2468@gmail.com",
      "TEST: AMAL-NAMA Email Service",
      "critical-attendance",
      {
        studentName: "Ali Ibrahim",
        courseName: "Data Structures",
        attendance: 81,
      }
    );
    res.json({
      success: result,
      message: result ? "Email test sent! Check your inbox." : "Email test failed.",
    });
  });

  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, type, data } = req.body;

      if (!to || !subject || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const success = await sendEmailViaResend(to, subject, type, data);

      if (success) {
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Email endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
