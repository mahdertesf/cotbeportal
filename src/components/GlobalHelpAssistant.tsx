'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { HelpCircle, Send, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getGeminiPortalHelp } from '@/ai/flows/get-gemini-portal-help'; // Placeholder for Genkit flow

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function GlobalHelpAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Placeholder: gather context about current page or portal functionalities
      const portalFunctionalityContext = "The CoTBE portal allows students to register for courses, view academic history, and access course materials. Teachers can manage courses, grades, and materials. Staff Heads have administrative oversight.";
      
      const response = await getGeminiPortalHelp({ 
        userQuery: userMessage.text,
        portalFunctionalityContext: portalFunctionalityContext
      });
      
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: response.answer, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching help from AI:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I couldn't fetch a response. Please try again later.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
        aria-label="Open CoTBE AI Help Assistant"
      >
        <HelpCircle className="h-7 w-7" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col" side="right">
          <SheetHeader>
            <SheetTitle className="font-headline flex items-center"><Bot className="mr-2 h-6 w-6 text-primary" /> CoTBE AI Help Assistant</SheetTitle>
            <SheetDescription>
              Ask questions about using the CoTBE portal.
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-grow my-4 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-lg shadow ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] p-3 rounded-lg shadow bg-muted text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <SheetFooter className="mt-auto pt-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g., How do I register for a course?"
                className="flex-grow"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} size="icon">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
