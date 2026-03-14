const messagesDiv = document.getElementById("messages");
const input = document.getElementById("userInput");
const historyList = document.getElementById("historyList");
const usernameDisplay = document.getElementById("usernameDisplay");
const themeSelect = document.getElementById("themeSelect");

// Load saved theme
const savedTheme = localStorage.getItem("solvoTheme") || "dark";
document.body.className = savedTheme;
if (themeSelect) {
  themeSelect.value = savedTheme;
}

// Theme change function
function changeTheme() {
  const selectedTheme = themeSelect.value;
  document.body.className = selectedTheme;
  localStorage.setItem("solvoTheme", selectedTheme);
}

// 🔹 Check Login - redirect to login if not logged in
const savedUser = localStorage.getItem("solvoUser");

if (!savedUser) {
  // Try to get username from username selection page
  const selectedUsername = localStorage.getItem("username");
  if (selectedUsername) {
    localStorage.setItem("solvoUser", selectedUsername);
  } else {
    window.location.href = "login.html";
  }
}

usernameDisplay.innerText = savedUser || localStorage.getItem("solvoUser");

// 🔹 Load Chats
let chats = JSON.parse(localStorage.getItem("solvoChats")) || [];
let currentChatIndex = null;

// 🔹 Conversation History for API
let conversationHistory = [
  {
    role: "system",
    content: "You are Solvo AI, a professional coding assistant. Answer clearly with code examples."
  }
];

// 🔹 Send Message
async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, "user");
  
  // Add to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // Save to local storage
  if (currentChatIndex !== null) {
    chats[currentChatIndex].messages.push({
      role: "user",
      content: userMessage
    });
  }

  saveChats();
  input.value = "";

  // Show typing indicator
  const typingMsg = addMessage("Solvo AI is thinking...", "bot");

  try {
    const res = await fetch("/chat/public", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await res.json();

    // Remove typing indicator
    typingMsg.remove();

    if (data.choices && data.choices[0].message) {
      const botReply = data.choices[0].message.content;
      addMessage(botReply, "bot");
      
      // Add to conversation history
      conversationHistory.push({ role: "assistant", content: botReply });
      
      // Save to local storage
      if (currentChatIndex !== null) {
        chats[currentChatIndex].messages.push({
          role: "assistant",
          content: botReply
        });
      }
      saveChats();
    } else {
      addMessage("Error: Invalid response from AI.", "bot");
    }

  } catch (error) {
    typingMsg.remove();
    addMessage("Error connecting to AI.", "bot");
    console.error(error);
  }
}

// 🔹 Add Message
function addMessage(text, sender) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", sender);

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");

  // 🌸 User | 💜 AI
  avatar.innerText = sender === "user" ? "🌸" : "💜";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  if (text.includes("```")) {
    bubble.innerHTML = formatCodeBlocks(text);
  } else {
    bubble.innerText = text;
  }

  const copyBtn = document.createElement("button");
  copyBtn.classList.add("copy-btn");
  copyBtn.innerText = "Copy";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(text);
    copyBtn.innerText = "Copied!";
    setTimeout(() => copyBtn.innerText = "Copy", 1500);
  };

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  if (sender === "bot") {
    wrapper.appendChild(copyBtn);
  }

  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 🔹 Code Block Formatter
function formatCodeBlocks(text) {
  const parts = text.split("```");

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return `
        <div class="code-block">
          <pre><code>${part}</code></pre>
          <button class="code-copy" onclick="copyCode(this)">Copy Code</button>
        </div>
      `;
    }
    return `<p>${part}</p>`;
  }).join("");
}

function copyCode(button) {
  const code = button.previousElementSibling.innerText;
  navigator.clipboard.writeText(code);
  button.innerText = "Copied!";
  setTimeout(() => button.innerText = "Copy Code", 1500);
}

// 🔹 New Chat
function createNewChat() {
  const newChat = {
    title: "Chat " + (chats.length + 1),
    messages: []
  };

  chats.push(newChat);
  currentChatIndex = chats.length - 1;
  
  // Reset conversation history for new chat
  conversationHistory = [
    {
      role: "system",
      content: "You are Solvo AI, a professional coding assistant. Answer clearly with code examples."
    }
  ];
  
  saveChats();
  renderHistory();
  messagesDiv.innerHTML = "";
}

// 🔹 Load Chat
function loadChat(index) {
  currentChatIndex = index;
  messagesDiv.innerHTML = "";

  // Rebuild conversation history from loaded chat
  conversationHistory = [
    {
      role: "system",
      content: "You are Solvo AI, a professional coding assistant. Answer clearly with code examples."
    }
  ];
  
  chats[index].messages.forEach(msg => {
    addMessage(
      msg.content,
      msg.role === "user" ? "user" : "bot"
    );
    conversationHistory.push({ role: msg.role, content: msg.content });
  });
}

// 🔹 Render History
function renderHistory() {
  historyList.innerHTML = "";

  chats.forEach((chat, index) => {
    const div = document.createElement("div");
    div.classList.add("history-item");
    div.innerText = chat.title;
    div.onclick = () => loadChat(index);
    historyList.appendChild(div);
  });
}

// 🔹 Save Chats
function saveChats() {
  localStorage.setItem("solvoChats", JSON.stringify(chats));
}

// 🔹 Logout
function logout() {
  localStorage.removeItem("solvoUser");
  localStorage.removeItem("solvoChats");
  window.location.href = "index.html";
}

// 🔹 Handle Enter key
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 🔹 Auto-resize textarea
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});

// 🔹 Initialize
if (chats.length === 0) {
  createNewChat();
} else {
  renderHistory();
  loadChat(0);
}

