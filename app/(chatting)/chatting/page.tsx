// page.tsx
"use client";
import React, { useState, useRef, FormEvent, useEffect, KeyboardEvent } from 'react';
import Image from 'next/image';
import axios from 'axios';

interface ChatItem {
  message: string;
  response: string;
}

const Loader: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="loader"></div>
    <style jsx>{`
      .loader {
        display: inline-block;
        width: 80px;
        height: 80px;
      }
      .loader:after {
        content: " ";
        display: block;
        width: 64px;
        height: 64px;
        margin: 8px;
        border-radius: 50%;
        border: 6px solid #fff;
        border-color: #fff transparent #fff transparent;
        animation: loader 1.2s linear infinite;
      }
      @keyframes loader {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

const Page: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [defaultSuggestions, setDefaultSuggestions] = useState<string[]>([
    'What are the main features of MiningNiti for managing mining data?',
    'What are the latest trends in mining technology?',
    'How do mining companies manage environmental impact?',
    'What are the safety regulations in the mining industry?',
    'Can you explain the process of ore extraction?'
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    };
    handleResize();
  }, [message]);

  const fetchSuggestions = async (input: string) => {
    // Placeholder for fetching suggestions, replace URL and logic as needed
    try {
      const response = await axios.get(`http://localhost:8000/suggestions?q=${input}`);
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    if (newMessage.trim() === '') {
      setSuggestions([]);
      setDefaultSuggestions([
        'What are the main features of MiningNiti for managing mining data?',
        'What are the latest trends in mining technology?',
        'How do mining companies manage environmental impact?',
        'What are the safety regulations in the mining industry?',
        'Can you explain the process of ore extraction?'
      ]);
    } else {
      fetchSuggestions(newMessage);
      setDefaultSuggestions([]);
    }
  };

  const handleSubmit = async (messageToSend: string) => {
    setIsSending(true);
    setError(null);
    const data = { input_query: messageToSend };
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/chat',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setChatLog([...chatLog, { message: messageToSend, response: response.data.response }]);
      setMessage('');
      setSuggestions([]);
      setDefaultSuggestions([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error(error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(message);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await handleSubmit(suggestion);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default newline behavior
      handleFormSubmit(e as unknown as FormEvent<HTMLFormElement>); // Trigger form submission
    }
  };

  return (
    <div className='pt-0 px-4' style={{ height: '100vh', overflowY: 'auto' }}>
      {isSending && <Loader />}
      <div className='flex flex-col items-center mt-8'>
        <Image
          className='h-30 w-30 rounded-full'
          src='/icon.png'
          alt='Profile Icon'
          height={60}
          width={60}
          priority={true}
        />
        <p className='text-2xl text-pink-500 font-bold'>Chat Application</p>
      </div>
      <div className='fixed bottom-0 w-full bg-transparent pb-4'>
        <form onSubmit={handleFormSubmit} className='flex items-center p-2 mx-auto w-full max-w-7xl'>
          <textarea
            id='chat'
            rows={1}
            ref={textareaRef}
            className='flex-1 p-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring focus:border-blue-500 resize-none overflow-hidden overflow-auto'
            placeholder='Your message...'
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{ minHeight: '40px', maxHeight: '200px' }}
            aria-label="Type your message here"
          />
          <button
            type='submit'
            disabled={isSending}
            className='p-2 ml-4 rounded-full bg-pink-500'
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
        {suggestions.length > 0 && (
          <div className="absolute bottom-20 left-0 right-0 mx-auto w-full max-w-7xl bg-gray shadow-lg p-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="cursor-pointer hover:bg-gray-200 p-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
        {defaultSuggestions.length > 0 && message.trim() === '' && (
          <div className="absolute bottom-20 left-0 right-0 mx-auto w-full max-w-7xl bg-green shadow-lg p-4">
            {defaultSuggestions.map((suggestion, index) => (
             <div
             key={index}
             className="cursor-pointer hover:bg-pink-100 hover:text-black p-2 transition-colors duration-150"
             onClick={() => handleSuggestionClick(suggestion)}
           >
             {suggestion}
           </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </div>
      <div
        className='my-4 flex flex-col items-center'
        ref={chatContainerRef}
        style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}
      >
        {chatLog.map((item, index) => (
          <div key={index} className='flex flex-col items-center w-full'>
            <div className='bg-pink-100 text-blue-900 p-4 rounded-lg shadow-md my-2 w-3/4'>
              <p className='text-left text-sm font-bold'>{item.message}</p>
            </div>
            <div className='bg-gray-100 text-gray-900 p-4 rounded-lg shadow-md my-2 w-3/4'>
              {item.response}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
