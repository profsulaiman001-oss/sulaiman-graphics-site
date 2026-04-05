import { useState } from "react";
import { Send, Bot, User, ArrowRight, Sparkles } from "lucide-react";

// Pre-set knowledge base for your "Receptionist"
const KNOWLEDGE_BASE = [
  {
    keywords: ["price", "cost", "how much", "rate"],
    answer: "Pricing at Sulaiman Graphics depends on the project scope. Custom websites generally start with a base rate, and features like E-commerce or custom databases scale from there. For an exact quote, I highly recommend filling out our Project Questionnaire!"
  },
  {
    keywords: ["time", "how long", "duration", "turnaround"],
    answer: "Standard web design projects usually take between 2 to 4 weeks depending on how quickly content and approvals are provided. Complex web applications may take longer."
  },
  {
    keywords: ["logo", "branding", "graphic"],
    answer: "Yes! Sulaiman Graphics offers complete brand identity packages including logos, color palettes, typography, and brand assets to make sure your business looks professional."
  },
  {
    keywords: ["dashboard", "portal", "login"],
    answer: "Our clients get access to a private dashboard where they can chat with me directly, track project progress, and manage assets in real-time!"
  },
  {
    keywords: ["questionnaire", "start", "hiring"],
    answer: "To get started, please navigate to our Questionnaire page. Filling that out gives me all the details I need to understand your vision and give you a proper project roadmap."
  }
];

export default function Assistant() {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am the Sulaiman Graphics virtual assistant. I can answer quick questions about our services, timelines, and process while Sulaiman is away. How can I help you today?", 
      isBot: true 
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    
    const query = input.toLowerCase();
    setInput("");

    // Simulate AI thinking and finding the answer
    setTimeout(() => {
      let botResponse = "I'm not quite sure about that specific detail! Let me notify Sulaiman, or you can fill out our Project Questionnaire to get a direct consultation.";

      // Scan our knowledge base for matching keywords
      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(keyword => query.includes(keyword))) {
          botResponse = item.answer;
          break;
        }
      }

      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    }, 800);
  };

  return (
    <div className="bg-[#0B0C10] min-h-screen text-gray-100 flex flex-col items-center justify-center p-4 pt-24">
      <div className="w-full max-w-2xl bg-[#11141A] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-[#1A1F29]/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              Sulaiman AI <Sparkles className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-xs text-gray-500">Virtual Receptionist</p>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-3 ${msg.isBot ? "" : "flex-row-reverse"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                msg.isBot ? 'bg-gray-800 text-gray-400' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-black'
              }`}>
                {msg.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] p-4 rounded-t-2xl text-sm leading-relaxed ${
                msg.isBot 
                  ? 'bg-[#1A1F29] border border-gray-800 text-gray-200 rounded-br-2xl'
                  : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-bl-2xl shadow-lg'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-800 bg-[#11141A]">
          <div className="flex items-center gap-2 bg-[#1A1F29] border border-gray-800 rounded-xl px-3 py-2 focus-within:border-cyan-500/50 transition-colors">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me about pricing, timelines, logos..." 
              className="flex-grow bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 min-w-0"
            />
            <button 
              onClick={handleSend}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick link to questionnaire to funnel traffic */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Ready to start a project instead?</p>
        <button className="text-cyan-500 hover:text-cyan-400 text-sm font-semibold flex items-center gap-1 mx-auto transition-colors">
          Go to Questionnaire <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
            }
