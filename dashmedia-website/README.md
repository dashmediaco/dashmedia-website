# Dash Media website

Static marketing site (`index.html`, `css/`, `js/`, `images/`) plus one serverless
function, `api/contact.js`, that relays contact-form leads to GoHighLevel.

## Required environment variable

Set this in Vercel: **Project Settings → Environment Variables**

| Name | Value |
|---|---|
| `GHL_WEBHOOK_URL` | The Inbound Webhook URL from your GoHighLevel workflow |

The form will not be able to send leads anywhere until this is set, and the
project is redeployed after adding it (Vercel picks up new env vars only on
the next deploy).

## Local structure

```
index.html
css/style.css
js/main.js
images/dash-mark.png
api/contact.js     <- serverless function, POST only
```

No build step is required — this deploys as-is once imported into Vercel.
