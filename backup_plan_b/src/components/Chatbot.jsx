import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Chatbot() {
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
    const savedHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setHistory(savedHistory);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { text: input, sender: "user" };
    setMessages([...messages, newMessage]);
    setHistory([...history, input]);
    localStorage.setItem("chatHistory", JSON.stringify([...history, input]));
    setInput("");
    setTimeout(() => {
      const botMessage = { text: "This is a demo AI response 🤖", sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className={`min-h-screen flex bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white ${theme === "light" ? "bg-gray-100 text-black" : theme === "levo" ? "bg-gray-900" : ""}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-black/30 backdrop-blur-md p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">🤖 Solvo AI</h2>
        <select
          value={theme}
          onChange={(e) => changeTheme(e.target.value)}
          className="mb-4 p-2 rounded bg-white/20 text-white"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="levo">Levo</option>
        </select>
        <Link to="/signin" className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition">
          Login
        </Link>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg max-w-md ${msg.sender === "user" ? "bg-purple-600 ml-auto" : "bg-gray-700"}`}
            >
              {msg.text}
            </motion.div>
          ))}
        </div>
        <div className="p-6 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Solvo AI anything..."
            className="flex-1 p-3 rounded-l bg-white/20 text-white placeholder-white/60 outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-purple-600 px-6 py-3 rounded-r hover:bg-purple-700 transition"
          >
            Send
          </button>
        </div>
      </main>

      {/* Right History Panel */}
      <aside className="w-64 bg-black/30 backdrop-blur-md p-6">
        <h3 className="text-xl font-bold mb-4">Chat History</h3>
        <ul className="space-y-2">
          {history.map((item, i) => (
            <li key={i} className="p-2 bg-white/10 rounded hover:bg-white/20 cursor-pointer">
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
