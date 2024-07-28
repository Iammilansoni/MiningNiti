// page.tsx
"use client";

import React, { useState, useRef, FormEvent } from 'react';
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSending(true);
  setError(null);
  const data = { input_query: message };
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
    setChatLog([...chatLog, { message: message, response: response.data.response }]);
    setMessage('');
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error details:', error.message);
  } else {
    console.error('An unknown error occurred:', error);
  }
  setError('Failed to send message. Please try again.');
}
  } finally {
    setIsSending(false);
  }
};


  const renderResponse = (response: string) => {
    const points = response.split(/\n|\d+\.\s+/).filter(point => point.trim() !== '');
    return points.length > 1 ? (
      <ul className='list-disc list-inside'>
        {points.map((point, index) => (
          <li key={index} className='text-left text-sm mt-1'>{point.trim()}</li>
        ))}
      </ul>
    ) : (
      <p className='text-left text-sm mt-1'>{response}</p>
    );
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
      <div className='fixed bottom-0 h-16 w-full bg-transparent'>
        <form onSubmit={handleSubmit} className='flex items-center justify-between p-2 mx-auto w-full max-w-7xl'>
          <textarea
            id='chat'
            rows={1}
            className='flex-1 p-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring focus:border-blue-500'
            placeholder='Your message...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
              {renderResponse(item.response)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
