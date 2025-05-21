import React, { useState, useEffect } from 'react';
import { SendHorizonal, Paperclip, Globe, Bot } from 'lucide-react';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiTypingText, setAiTypingText] = useState('');
  const [fullAiResponse, setFullAiResponse] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setAiTypingText('');

    try {
      const aiText = await callGroqAPI(updatedMessages);
      setFullAiResponse(aiText);
    } catch (err) {
      console.error('Groq API Error:', err);
      setFullAiResponse('Oops! Something went wrong.');
    }
  };

  const callGroqAPI = async (chatHistory) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('Missing Groq API key');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'You are DevRoot AI, a helpful assistant.' },
          ...chatHistory
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'No response from AI.';
  };

  useEffect(() => {
    if (isTyping && fullAiResponse) {
      let i = 1;
const interval = setInterval(() => {
  setAiTypingText(fullAiResponse.slice(0, i));
  i++;
  if (i > fullAiResponse.length) {
    clearInterval(interval);
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: 'assistant', content: fullAiResponse }]);
    setFullAiResponse('');
  }
  console.log('Raw AI response:', fullAiResponse);
}, 30);

      return () => clearInterval(interval);
    }
  }, [isTyping, fullAiResponse]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col items-center justify-center px-4">
      {messages.length === 0 && !isTyping ? (
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Bot className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-semibold">Hi, I'm DevRoot AI.</h1>
          </div>
          <p className="text-gray-400">How can I help you today?</p>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-4 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`${
                  msg.role === 'user' ? 'bg-[#3b3b3b]' : 'bg-[#2b2b2b]'
                } rounded-xl px-2 py-2 max-w-sm text-white`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#2b2b2b] rounded-xl px-4 py-2 max-w-sm text-white">
                {aiTypingText}
                <span className="animate-pulse text-gray-500">|</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-[#2b2b2b] w-full max-w-2xl rounded-2xl p-4 flex flex-col gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message DevRoot AI"
          className="bg-transparent outline-none text-white placeholder:text-gray-500 text-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isTyping}
          autoComplete="off"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <button className="bg-[#3b3b3b] text-white text-sm px-3 py-1 rounded-full flex items-center gap-1" type="button">
              <Bot className="w-4 h-4" />
              DeepThink
            </button>
            <button className="bg-[#3b3b3b] text-white text-sm px-3 py-1 rounded-full flex items-center gap-1" type="button">
              <Globe className="w-4 h-4" />
              Search
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-white" type="button" aria-label="Attach file">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              className="bg-[#3f3f3f] text-white p-2 rounded-full hover:bg-[#555]"
              disabled={isTyping}
              aria-label="Send message"
              type="button"
            >
              <SendHorizonal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
