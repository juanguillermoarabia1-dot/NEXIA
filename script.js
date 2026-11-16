/* NEXIA 1.0 - interfaz local.
   Esta versión guarda conversaciones en el dispositivo, pero aún NO contiene un modelo de IA.
   La respuesta de demostración evita fingir que hay una IA conectada. */
const $ = (id) => document.getElementById(id);
const input = $("messageInput");
const messages = $("messages");
const welcome = $("welcome");
const STORAGE_KEY = "nexia_chats_v1";
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
}
function openChat(id) {
  activeChatId = id;
  const chat = currentChat();
  messages.replaceChildren();
  welcome.hidden = chat.messages.length > 0;
  chat.messages.forEach(m => addBubble(m.role, m.text));
  document.body.classList.remove("menu-open");
}
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  if (!activeChatId || !currentChat()) createChat();
  const chat = currentChat();
  chat.messages.push({ role: "user", text });
  if (chat.messages.length === 1) chat.title = text.slice(0, 36);
  welcome.hidden = true;
  addBubble("user", text);
  input.value = "";
  input.style.height = "auto";
  saveChats();

  const notice = "NEXIA todavía no tiene conectado el modelo de inteligencia artificial. Esta es la interfaz inicial; el siguiente paso es integrar el motor local para que pueda responder sin Internet ni créditos.";
  chat.messages.push({ role: "assistant", text: notice });
  addBubble("assistant", notice);
  saveChats();
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
renderHistory();
if (chats.length) openChat(chats[0].id);
else createChat();
