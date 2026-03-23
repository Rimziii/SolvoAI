const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const themeSelect = document.getElementById("themeSelect");
const conversationList = document.getElementById("conversationList");

let conversations = JSON.parse(localStorage.getItem("convos")) || [];
let currentChat = [];
let conversationHistory = [
  {
    role: "system",
    content: "You are Solvo AI, a professional coding assistant. Answer clearly with code examples."
  }
];

// Check auth on load
window.onload = async () => {
  const token = localStorage.getItem('authToken');
  
  // Load theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
  
  // Render existing conversations
  renderConversations();
  showWelcome();
};

themeSelect.addEventListener("change", function () {
  document.body.className = this.value;
  localStorage.setItem("theme", this.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  conversationHistory.push({ role: "user", content: text });

  const thinkingMsg = addMessage("Solvo AI is thinking...", "bot");

  const token = localStorage.getItem('authToken');
  
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    
    // Add auth header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/chat/public", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    // If unauthorized, redirect to login
    if (response.status === 401 || response.status === 403) {
      thinkingMsg.remove();
      addMessage("Please login to continue chatting. <a href='login.html'>Login here</a>", "bot");
      return;
    }

    const data = await response.json();

    if (!data.choices) {
      throw new Error("Invalid response from API");
    }

    const reply = data.choices[0].message.content;

    thinkingMsg.remove();

    conversationHistory.push({ role: "assistant", content: reply });

    addMessage(reply, "bot");

  } catch (error) {
    console.error("API Error:", error);
    thinkingMsg.remove();
    addMessage("Error connecting to AI. Make sure the server is running.", "bot");
  }
}

function addMessage(text, sender) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + sender;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerText = sender === "user" ? "U" : "S";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  
  // Process text for code blocks
  bubble.innerHTML = processText(text);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  
  return wrapper;
}

function processText(text) {
  // Escape HTML
  let processed = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>');
  
  // Convert newlines to <br>
  processed = processed.replace(/\n/g, '<br>');
  
  return processed;
}

function newChat() {
  if (currentChat.length > 0) {
    conversations.push(currentChat);
    localStorage.setItem("convos", JSON.stringify(conversations));
  }
  currentChat = [];
  conversationHistory = [
    {
      role: "system",
      content: "You are Solvo AI, a professional coding assistant. Answer clearly with code examples."
    }
  ];
  messages.innerHTML = "";
  renderConversations();
  showWelcome();
}

function renderConversations() {
  conversationList.innerHTML = "";
  conversations.forEach((chat, index) => {
    const div = document.createElement("div");
    div.innerText = "Chat " + (index + 1);
    div.onclick = () => loadConversation(index);
    conversationList.appendChild(div);
  });
}

function loadConversation(index) {
  messages.innerHTML = "";
  currentChat = conversations[index];
  currentChat.forEach(msg => {
    addMessage(msg.text, msg.sender);
  });
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

function showWelcome() {
  messages.innerHTML = `
    <div class="welcome">
      <h1>Welcome to Solvo AI</h1>
      <p>Your intelligent problem-solving assistant.</p>
      <p><a href="login.html">Login</a> to save your chat history permanently.</p>
    </div>
  `;
}

function goToLogin() {
  window.location.href = "login.html";
}
