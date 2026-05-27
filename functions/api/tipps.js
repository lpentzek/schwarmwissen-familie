const SHEET_RANGE = "A:Z";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export async function onRequestGet({ env }) {
  try {
    assertEnv(env);

    const accessToken = await getAccessToken(env);
    const values = await getSheetValues(env.GOOGLE_SHEET_ID, accessToken);
    const tips = rowsToTips(values);

    return json(tips, {
      "Cache-Control": "no-store",
    });
  } catch (error) {
    return json(
      {
        error: "Tipps konnten nicht geladen werden.",
        details: error.message,
      },
      {},
      500
    );
  }
}

function assertEnv(env) {
  const missing = ["GOOGLE_SHEET_ID", "GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"].filter(
    (key) => !env[key]
  );

  if (missing.length) {
    throw new Error(`Fehlende Environment Variables: ${missing.join(", ")}`);
  }
}

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const jwt = await signJwt(claimSet, env.GOOGLE_PRIVATE_KEY);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Google Token API antwortet mit ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getSheetValues(sheetId, accessToken) {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      SHEET_RANGE
    )}`
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Sheets API antwortet mit ${response.status}`);
  }

  const data = await response.json();
  return data.values || [];
}

async function signJwt(payload, privateKey) {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${arrayBufferToBase64Url(signature)}`;
}

function pemToArrayBuffer(pem) {
  const normalized = pem.replaceAll("\\n", "\n");
  const base64 = normalized
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function rowsToTips(values) {
  if (values.length < 2) return [];

  const [headers, ...rows] = values;
  return rows
    .filter((row) => row.some(Boolean))
    .map((row) => {
      const item = Object.fromEntries(
        headers.map((header, index) => [normalizeHeader(header), row[index] || ""])
      );

      return {
        titel: item.titel || item.name || item.titel_name || "",
        kategorie: item.kategorie || "Sonstiges",
        alter_min: item.alter_min || item.alter_von || item.ab_alter || "",
        alter_max: item.alter_max || item.alter_bis || "",
        medium: item.medium || item.typ || "",
        ort: item.ort || "",
        quelle: item.quelle || item.empfohlen_von || "",
        hinweise:
          item.hinweise ||
          item.bemerkungen ||
          item.hinweise_bemerkungen ||
          item.hinweise_und_bemerkungen ||
          item.warum ||
          "",
        tags: item.tags || "",
        bewaehrt_seit: item.bewaehrt_seit || item.bewahrt_seit || item.seit || "",
        url: item.url || item.link || "",
      };
    });
}

function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replaceAll("&", "und")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function base64Url(value) {
  return arrayBufferToBase64Url(new TextEncoder().encode(value));
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
