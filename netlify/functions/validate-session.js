export async function handler(event, context) {
  const body = JSON.parse(event.body || "{}");
  const { code, token } = body;

  // -----------------------------
  // 1. LOGIN: Validate Access Code
  // -----------------------------
  if (code) {
    const apiUrl = "YOUR_GOOGLE_SCRIPT_URL?code=" + code;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: 200,
        body: JSON.stringify({ valid: false })
      };
    }

    // Generate 1-hour signed token
    const tokenData = { code, exp: Date.now() + 3600 * 1000 };
    const newToken = Buffer.from(JSON.stringify(tokenData)).toString("base64");

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true, token: newToken })
    };
  }

  // ---------------------------------
  // 2. TOKEN VALIDATION (page access)
  // ---------------------------------
  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
      if (decoded.exp < Date.now()) {
        return { statusCode: 200, body: JSON.stringify({ valid: false }) };
      }

      return { statusCode: 200, body: JSON.stringify({ valid: true }) };
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ valid: false }) };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: false })
  };
}
