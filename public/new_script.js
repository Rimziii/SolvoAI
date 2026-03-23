document.addEventListener('DOMContentLoaded', () => {
  // Identify which page we're on by searching for expected elements
  if (document.body.classList.contains('chatbot-body')) {
    initChatbotPage();
  }
});

async function initChatbotPage() {
  // Auth guard
  if (!localStorage.getItem('authToken')) {
    window.location.href = '/login.html';
    return;
  }

  const username = localStorage.getItem('username') || 'User';
  document.getElementById('username-display').innerText = username;

  const sendBtn = document.getElementById('send-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const newChatBtn = document.getElementById('new-chat');
  const chatMessages = document.getElementById('chat-messages');
  const chatHistoryEl = document.getElementById('chat-history');
  const statusEl = document.getElementById('status');

  let chats = JSON.parse(localStorage.getItem('chats') || '[]');
  let currentChat = null;

  function renderHistory() {
    chatHistoryEl.innerHTML = '';
    chats.slice().reverse().forEach((c) => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerText = c.title || ('Chat ' + new Date(c.id).toLocaleString());
      div.onclick = () => { loadChat(c.id); };
      chatHistoryEl.appendChild(div);
    });
  }

  function saveChats() { localStorage.setItem('chats', JSON.stringify(chats)); }

  function newChat(prefill) {
    currentChat = { id: Date.now(), title: 'New Chat', messages: [] };
    if (prefill) {
      currentChat.messages.push({ role: 'user', text: prefill.text, language: prefill.language });
    }
    chats.push(currentChat);
    saveChats();
    renderHistory();
    renderMessages();
  }

  function loadChat(id) {
    currentChat = chats.find(c => c.id === id);
    renderMessages();
  }

  function renderMessages() {
    chatMessages.innerHTML = '';
    if (!currentChat) return;
    currentChat.messages.forEach(m => {
      const div = document.createElement('div');
      div.className = m.role === 'user' ? 'message user-message' : 'message bot-message';
      div.textContent = m.text;
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendCode(code, language) {
    statusEl.innerText = 'Checking...';
    try {
      const res = await fetch('/check-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      statusEl.innerText = 'Ready';
      return data;
    } catch (err) {
      console.error(err);
      statusEl.innerText = 'Error';
      return { isCorrect: false, message: 'Error contacting server.' };
    }
  }

  sendBtn.addEventListener('click', async () => {
    const code = document.getElementById('code-input').value.trim();
    const language = document.getElementById('language-select').value || '';
    if (!code) return;
    if (!currentChat) newChat();

    currentChat.messages.push({ role: 'user', text: code, language });
    saveChats();
    renderMessages();

    const result = await sendCode(code, language);

    const botText = result.isCorrect ? (result.message || 'Execution ok') : (result.message || 'There was an error');
    currentChat.messages.push({ role: 'bot', text: botText });
    if (result.correctedCode) currentChat.messages.push({ role: 'bot', text: '\nCorrected code:\n' + result.correctedCode });
    // Update chat title from first message
    currentChat.title = code.split('\n')[0].slice(0,60) || 'Chat ' + new Date(currentChat.id).toLocaleString();
    saveChats();
    renderHistory();
    renderMessages();
    document.getElementById('code-input').value = '';
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
  });

  newChatBtn.addEventListener('click', () => {
    newChat();
  });

  // Load last chat or create new
  if (chats.length) { currentChat = chats[chats.length - 1]; }
  else { newChat(); }
  renderHistory();
  renderMessages();

  // If there's a pending question from landing page, preload and send
  const pending = sessionStorage.getItem('pendingQuestion');
  if (pending) {
    try {
      const p = JSON.parse(pending);
      if (p && (p.question || p.language)) {
        document.getElementById('code-input').value = p.question || '';
        document.getElementById('language-select').value = p.language || '';
      }
    } catch {}
    sessionStorage.removeItem('pendingQuestion');
  }
}
