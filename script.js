/* NEXIA 1.0 - Conectada a Gemini API de forma segura en el navegador */
const $ = (id) => document.getElementById(id);
const input = $("messageInput");
const messages = $("messages");
const welcome = $("welcome");

const STORAGE_KEY = "nexia_chats_v1";
const API_KEY_STORAGE = "nexia_gemini_key";

let chats = loadChats();
let activeChatId = null;

function loadChats() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveChats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  renderHistory();
}

function askForApiKey(forcePrompt = false) {
  let key = localStorage.getItem(API_KEY_STORAGE);
  if (!key || forcePrompt) {
    const newKey = prompt(
      "Pega tu API Key de Google AI Studio (se guardará de forma segura solo en este dispositivo):",
      key || ""
    );
    if (newKey !== null && newKey.trim()) {
      key = newKey.trim();
      localStorage.setItem(API_KEY_STORAGE, key);
      if (forcePrompt) alert("API Key actualizada correctamente.");
    }
  }
  return key ? key.trim() : null;
}

function createApiButton() {
  const btn = document.createElement("button");
  btn.textContent = "🔑 API Key";
  btn.title = "Configurar o cambiar tu API Key";
  Object.assign(btn.style, {
    position: "fixed",
    top: "12px",
    right: "14px",
    zIndex: "1000",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(128,128,128,0.35)",
    background: "rgba(30,30,35,0.85)",
    color: "#ffffff",
    fontSize: "12px",
    cursor: "pointer"
  });
  btn.addEventListener("click", () => askForApiKey(true));
  document.body.appendChild(btn);
}

function createChat() {
  const chat = { id: String(Date.now()), title: "Nueva conversación", messages: [] };
  chats.unshift(chat);
  activeChatId = chat.id;
  messages.replaceChildren();
  welcome.hidden = false;
  saveChats();
  input.focus();
}

function currentChat() {
  return chats.find(c => c.id === activeChatId);
}

function renderHistory() {
  const list = $("historyList");
  list.replaceChildren();
  chats.forEach(chat => {
    const btn = document.createElement("button");
    btn.className = "history-item";
    btn.textContent = chat.title;
    btn.addEventListener("click", () => openChat(chat.id));
    list.appendChild(btn);
  });
}

function addBubble(role, text) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text; // textContent evita interpretar HTML escrito por el usuario.
  row.appendChild(bubble);
  messages.appendChild(row);
  $("chat").scrollTop = $("chat").scrollHeight;
  return bubble;
}

function openChat(id) {
  activeChatId = id;
  const chat = currentChat();
  messages.replaceChildren();
  welcome.hidden = chat.messages.length > 0;
  chat.messages.forEach(m => addBubble(m.role, m.text));
  document.body.classList.remove("menu-open");
}

async function fetchGeminiReply(apiKey, history) {
  const url = `https://googleapis.com{encodeURIComponent(apiKey)}`;
  const contents = history.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }]
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "Eres NEXIA, un asistente personal útil, claro y amable. Responde siempre en español." }]
      },
      contents
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error de conexión (${response.status})`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta del modelo.";
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const apiKey = askForApiKey(false);
  if (!apiKey) {
    alert("Debes ingresar tu API Key para que NEXIA pueda responder.");
    return;
  }

  if (!activeChatId || !currentChat()) createChat();
  const chat = currentChat();
  chat.messages.push({ role: "user", text });
  if (chat.messages.length === 1) chat.title = text.slice(0, 36);
  welcome.hidden = true;
  addBubble("user", text);
  input.value = "";
  input.style.height = "auto";
  saveChats();

  const loadingBubble = addBubble("assistant", "Pensando...");

  try {
    const reply = await fetchGeminiReply(apiKey, chat.messages);
    loadingBubble.textContent = reply;
    chat.messages.push({ role: "assistant", text: reply });
    saveChats();
  } catch (error) {
    loadingBubble.textContent = "Error: " + error.message;
  }
}

$("sendBtn").addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 130) + "px";
});
$("newChat").addEventListener("click", () => { createChat(); document.body.classList.remove("menu-open"); });
$("clearBtn").addEventListener("click", createChat);
$("menuBtn").addEventListener("click", () => document.body.classList.toggle("menu-open"));
$("scrim").addEventListener("click", () => document.body.classList.remove("menu-open"));
document.querySelectorAll(".suggestion").forEach(btn => btn.addEventListener("click", () => {
  input.value = btn.dataset.prompt;
  input.focus();
}));

createApiButton();
renderHistory();
if (chats.length) openChat(chats[0].id);
else createChat();

