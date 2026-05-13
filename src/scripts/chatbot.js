/* ============================================
   INNOVATEK — AI Chatbot Logic (OpenRouter)
   ============================================ */

import { select } from './utils.js';

const OPENROUTER_API_KEY = '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';
const MODEL = 'meta-llama/llama-3.1-8b-instruct'; // Specific model requested

export function initChatbot() {
  const chatbot = select('.chatbot');
  const toggle = select('.chatbot__toggle');
  const messagesContainer = select('.chatbot__messages');
  const input = select('.chatbot__input');
  const sendBtn = select('.chatbot__send');

  if (!chatbot || !toggle) return;

  // Toggle open/close
  toggle.addEventListener('click', () => {
    chatbot.classList.toggle('open');
    if (chatbot.classList.contains('open')) {
      input.focus();
    }
  });

  // Initial greeting
  addMessage("Bonjour ! Je suis l'assistant IA d'Innovatek. Comment puis-je vous aider à automatiser votre entreprise aujourd'hui ?", 'bot');

  const FALLBACK_MODEL = 'openrouter/free';

  // Send message handler
  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage(text, 'user');
    const typingIndicator = showTyping();

    const messages = [
      {
        "role": "system",
        "content": "You are the official AI assistant of Innovatek, a premium AI automation agency based in Tunisia. \n\nRULES:\n1. If the user just says 'Hello' or greets you, respond with a very short, friendly greeting without a long description.\n2. Only provide a detailed overview of our services (AI Automations, Web/Mobile/SAAS apps) if the user specifically asks 'What do you do?' or 'Tell me more'.\n3. When giving detailed info, use bullet points with emojis and double line breaks for readability.\n4. Keep it visual and professional. Always respond in the language the user uses."
      },
      { "role": "user", "content": text }
    ];

    try {
      // First Attempt: Primary Model
      let botResponse = await callOpenRouter(MODEL, messages);
      
      typingIndicator.remove();
      addMessage(botResponse, 'bot');

    } catch (error) {
      console.warn("Primary model failed, trying fallback...", error);
      
      try {
        // Second Attempt: Fallback Model
        let botResponse = await callOpenRouter(FALLBACK_MODEL, messages);
        typingIndicator.remove();
        addMessage(botResponse, 'bot');
      } catch (fallbackError) {
        console.error("Chatbot Critical Error:", fallbackError);
        typingIndicator.remove();
        addMessage("Désolé, j'ai rencontré une petite erreur technique. Pouvez-vous réessayer ?", 'bot');
      }
    }
  };

  async function callOpenRouter(modelId, messages) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Innovatek AI"
      },
      body: JSON.stringify({
        "model": modelId,
        "messages": messages
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error(data.error?.message || "Invalid API response");
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  function addMessage(text, side) {
    const msg = document.createElement('div');
    msg.className = `chatbot__message chatbot__message--${side}`;
    // Support line breaks and bullet points
    msg.innerHTML = text.replace(/\n/g, '<br>');
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chatbot__typing';
    typing.innerHTML = '<div class="chatbot__dot"></div><div class="chatbot__dot"></div><div class="chatbot__dot"></div>';
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typing;
  }
}
