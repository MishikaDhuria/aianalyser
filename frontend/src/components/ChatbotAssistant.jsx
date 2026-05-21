import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your AI Interview Coach. Ask me any technical definitions, resume formatting tips, or coding strategies!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const token = useSelector((state) => state.auth.token);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userText,
          context: 'Floating Dashboard Widget'
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'I had trouble connecting to my brain. Please check your network connection.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Oops! Something went wrong on my end. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Pane */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[450px] bg-slate-950/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden mb-4 animate-float">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">AI Coach Assistant</h4>
                <p className="text-[10px] text-slate-400">Online & Ready</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                      : 'bg-slate-900/60 text-slate-200 border border-white/5'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[75%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-100 rounded-tl-none border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-slate-900 text-slate-400 border border-white/5">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-900 text-slate-400 text-xs px-3 py-2 rounded-2xl rounded-tl-none border border-white/5 animate-pulse">
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-950 border-t border-white/5 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-white placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 glow-cyan"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatbotAssistant;
