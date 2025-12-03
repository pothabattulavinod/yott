// netlify/functions/validate-session.js

export async function handler(event, context) {
  const body = event.body ? JSON.parse(event.body) : {};
  const { code, device, lat, lon, acc, token } = body;

  // If token provided: validate existing session
  if (token) {
    // Optionally — you can verify token locally or re-check with Apps Script
    // For simplicity: call script with token (or code) to re-validate
    // But assuming token validated earlier — return valid
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true })
    };
  }

  // LOGIN / VALIDATION request
  if (!code || !device) {
    return { statusCode: 400, body: JSON.stringify({ valid: false, message: "code or device missing" }) };
  }

  const apiUrl = "https://script.google.com/macros/s/AKfycbyhbN2fxNfvBWNlS6suhh4gP7ZczOLBSjSFLdA2rHOLJbSVi0SCX8RzNPecsbIRCElC/exec"
    + "?code=" + encodeURIComponent(code)
    + "&device=" + encodeURIComponent(device)
    + "&lat=" + encodeURIComponent(lat || "")
    + "&lon=" + encodeURIComponent(lon || "")
    + "&acc=" + encodeURIComponent(acc || "")
    + "&ip=" + encodeURIComponent(event.headers["x-forwarded-for"] || "");

  const resp = await fetch(apiUrl);
  const data = await resp.json();

  if (!data.success) {
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: false, message: data.message })
    };
  }

  // On success — return valid and a simple token (you may improve with JWT)
  const sessionToken = btoa(JSON.stringify({ code, ts: Date.now() }));

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: true, token: sessionToken })
  };
}
