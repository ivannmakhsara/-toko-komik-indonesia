'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface Message {
  id: string;
  sender: 'user' | 'seller';
  text: string;
  timestamp: number;
  read: boolean;
}

interface ChatContextType {
  messages: Message[];
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  sendMessage: (text: string, sender: 'user' | 'seller') => void;
  markAllRead: (side: 'user' | 'seller') => void;
  unreadForSeller: number;
  unreadForUser: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('chat-messages');
    if (saved) setMessages(JSON.parse(saved));
    else {
      // greeting dari seller
      const greeting: Message = {
        id: 'init',
        sender: 'seller',
        text: 'Halo! Selamat datang di Toko Komik Indonesia 👋 Ada yang bisa kami bantu?',
        timestamp: Date.now(),
        read: false,
      };
      setMessages([greeting]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);

  function sendMessage(text: string, sender: 'user' | 'seller') {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: Date.now(),
      read: false,
    };
    setMessages(prev => [...prev, msg]);
  }

  function markAllRead(side: 'user' | 'seller') {
    const other = side === 'user' ? 'seller' : 'user';
    setMessages(prev => {
      if (!prev.some(m => m.sender === other && !m.read)) return prev;
      return prev.map(m => (m.sender === other && !m.read) ? { ...m, read: true } : m);
    });
  }

  const unreadForSeller = messages.filter(m => m.sender === 'user' && !m.read).length;
  const unreadForUser   = messages.filter(m => m.sender === 'seller' && !m.read).length;

  return (
    <ChatContext.Provider value={{ messages, isOpen, setIsOpen, sendMessage, markAllRead, unreadForSeller, unreadForUser }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}
