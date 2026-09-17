// /api/contact — Vercel Serverless Function
// Receives the lead form submission from the site and relays it to GoHighLevel
// via an Inbound Webhook, kept server-side so the webhook URL is never exposed
// to anyone viewing page source or browser devtools.
//
// Required environment variable (set in Vercel Project Settings -> Environment Variables):
//   GHL_WEBHOOK_URL   the "Inbound Webhook" URL copied from your GoHighLevel workflow

const REQUIRED_FIELDS = ["fullName", "email", "phone", "company", "volume"];

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  const missing = REQUIRED_FIELDS.filter((field) => !body[field] || String(body[field]).trim() === "");
  if (missing.length > 0) {
    return res.status(400).json({ ok: false, error: "Missing required fields: " + missing.join(", ") });
  }

  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    // Server misconfigured — do not leak *why* beyond this, keep it generic for the client
    console.error("[api/contact] GHL_WEBHOOK_URL environment variable is not set");
    return res.status(500).json({ ok: false, error: "Server is not configured to accept submissions yet" });
  }

  const payload = {
    fullName: String(body.fullName).trim(),
    email: String(body.email).trim(),
    phone: String(body.phone).trim(),
    company: String(body.company).trim(),
    volume: String(body.volume).trim(),
    source: "dashmediaco.com contact form",
    submittedAt: new Date().toISOString()
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const ghlResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!ghlResponse.ok) {
      const text = await ghlResponse.text().catch(() => "");
      console.error("[api/contact] GHL webhook rejected the request:", ghlResponse.status, text);
      return res.status(502).json({ ok: false, error: "Lead system rejected the submission" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    clearTimeout(timeout);
    const isAbort = err && err.name === "AbortError";
    console.error("[api/contact] Error relaying to GHL:", isAbort ? "timed out" : err);
    return res.status(502).json({ ok: false, error: isAbort ? "Lead system timed out" : "Could not reach lead system" });
  }
};
