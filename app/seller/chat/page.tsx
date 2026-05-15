'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';

export default function SellerChatPage() {
  const { messages, sendMessage, markAllRead, unreadForSeller } = useChat();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markAllRead('seller');
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed, 'seller');
    setText('');
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="p-8 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white/80">Pesan Masuk</h1>
        {unreadForSeller > 0 && (
          <span className="bg-[#D90429] text-white text-xs font-bold px-2 py-1 rounded-full">
            {unreadForSeller} baru
          </span>
        )}
      </div>

      <div className="flex-1 bg-[#111113] border border-white/[0.07] rounded-[16px] overflow-hidden flex flex-col">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-white/[0.07] rounded-full flex items-center justify-center text-sm">👤</div>
          <div>
            <p className="font-semibold text-white/70 text-sm">Pembeli</p>
            <p className="text-xs text-white/30">{messages.length} pesan</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-white/30 text-sm">Belum ada pesan</p>
              </div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[65%] px-4 py-2.5 rounded-[16px] text-sm ${
                msg.sender === 'seller'
                  ? 'bg-[#D90429] text-white rounded-br-sm'
                  : 'bg-white/[0.07] text-white/70 rounded-bl-sm'
              }`}>
                <p className="leading-snug">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'seller' ? 'text-white/50' : 'text-white/30'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-4 border-t border-white/[0.07] flex gap-3 shrink-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Balas pesan pembeli..."
            className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-[12px] px-4 py-2.5 text-sm text-white/70 placeholder-white/25 focus:outline-none focus:border-white/25"
          />
          <button type="submit" disabled={!text.trim()}
            className="bg-[#D90429] text-white px-5 py-2.5 rounded-[12px] hover:bg-[#B0021F] disabled:opacity-40 transition-colors text-sm font-medium">
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
