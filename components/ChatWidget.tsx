'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';

export default function ChatWidget() {
  const { messages, isOpen, setIsOpen, sendMessage, markAllRead, unreadForUser } = useChat();
  const [text, setText] = useState('');
  const [activeChat, setActiveChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length > 0) setActiveChat(true);
    if (isOpen && activeChat) markAllRead('user');
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeChat) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChat]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed, 'user');
    setText('');
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  const lastMsg = messages[messages.length - 1];

  return (
    <>
      {/* Floating panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col"
          style={{ width: 580, height: 460 }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <span className="font-semibold text-gray-800 text-sm">Chat</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              aria-label="Tutup"
            >
              ⌄
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* ── Conversation list (left column) ── */}
            <div className="w-52 border-r border-gray-100 overflow-y-auto shrink-0 bg-white">
              <div
                onClick={() => setActiveChat(true)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-start gap-3 transition-colors ${
                  activeChat ? 'bg-red-50 border-r-2 border-red-600' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                  TK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="font-medium text-gray-800 text-sm truncate">Toko Komik</p>
                    {unreadForUser > 0 && (
                      <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {unreadForUser}
                      </span>
                    )}
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                    penjual
                  </span>
                  {lastMsg && (
                    <p className="text-xs text-gray-400 truncate mt-1">{lastMsg.text}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right panel ── */}
            {activeChat ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat sub-header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    TK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Toko Komik Indonesia</p>
                    <p className="text-xs text-red-600 font-medium">penjual</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 bg-white">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'bg-red-700 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p className="leading-snug">{msg.text}</p>
                        <p className={`text-xs mt-0.5 ${msg.sender === 'user' ? 'text-red-200' : 'text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="px-3 py-3 border-t border-gray-100 flex gap-2 shrink-0 bg-white">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-red-400"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="bg-red-700 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-800 disabled:opacity-40 transition-colors shrink-0 text-sm"
                  >
                    ➤
                  </button>
                </form>
              </div>
            ) : (
              /* Welcome screen */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-10 bg-white">
                <p className="text-5xl mb-4">💬</p>
                <p className="font-bold text-gray-800 text-lg mb-2">Mari memulai obrolan!</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Pilih pesan di samping untuk<br />mulai chat dengan penjual.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-red-700 text-white w-14 h-14 rounded-full shadow-lg hover:bg-red-800 transition-colors flex items-center justify-center text-2xl z-50"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && unreadForUser > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadForUser}
          </span>
        )}
      </button>
    </>
  );
}
