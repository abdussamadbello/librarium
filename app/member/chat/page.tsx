'use client';

import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';

export default function BookChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, setMessages, sendMessage, status } = useChat();

  const [input, setInput] = useState('');
  const isLoading = status === 'streaming' || status === 'submitted';

  // Add welcome message if messages are empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text: "Hello! I'm your library assistant. Ask me anything about books in our collection, and I'll help you find what you're looking for. What are you interested in reading today?",
            },
          ],
        } as any,
      ]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    
    await sendMessage({ text: userInput });
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Book Chat Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about our book collection
        </p>
      </div>

      {/* Messages Container */}
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {message.parts
                    .filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join('')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                <Bot className="w-5 h-5" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about books... (e.g., 'Science fiction novels about space exploration')"
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
