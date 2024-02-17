/** @jsxImportSource @emotion/react */
/** @jsxImportSource @emotion/react @jsxRuntime classic */
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'regenerator-runtime/runtime'; // Add this import
import { useSpeechRecognition } from 'react-speech-recognition';

const Page = () => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false); // Added loading state
  const {
    listening,
    startListening,
    stopListening,
    transcript,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    setMessage(transcript);
  }, [transcript]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { input_query: message };

    try {
      setLoading(true); // Set loading to true when starting the request

      const response = await axios.post(
        'http://localhost:8000/chat',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setChatLog([...chatLog, { message: message, response: response.data }]);
      setMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false when the request is completed
    }
  };

  return (
    <div className='pt-2 px-3'>
      <div className='flex justify-between p-8'>
        {/* logo */}
        <img
          className='h-23 w-48 rounded-full'
          src='/logo.png'
          alt='logo'
          content='cover'
        />
        {/* ThemeModeToggle component */}
      </div>
      <div className='flex flex-col items-center'>
        {/* Image component */}
        <p className='text-1.5xl text-blue-500 font-light text-center'>
          The Mining Industry Chatbot – your AI-powered guide to regulatory clarity.
        </p>
      </div>
      <div className='fixed bottom-1.5 h-16 w-full bg-transparent'>
        <form
          onSubmit={handleSubmit}
          className='flex items-justify-between p-2 mx-auto w-full max-w-4xl'
        >
          <textarea
            id='chat'
            rows={1}
            className='flex-1 p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring focus:border-blue-500'
            placeholder='Your message (or speak...)'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={startListening}
            className='voice-button bg-blue-500 text-white font-bold py-1 scroll-px-1 rounded-full hover:bg-blue-700'
          >
            Start Voice Input
          </button>

          <button
            onClick={stopListening}
            className='voice-button bg-red-500 text-white font-bold py-1 px-1 rounded-full hover:bg-red-700'
          >
            Stop Voice Input
          </button>
          <button
            type='submit'
            className='p-0.1 ml-0.1 rounded-full bg-gray-600'
          >
            <svg
              className='w-5 h-5 text-blue-600 transform rotate-90'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 18 20'
              fill='currentColor'
            >
              <path d='m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z' />
            </svg>
          </button>
        </form>
        {listening && <p>Listening...</p>}
        {transcript && <p className='user-query'>{transcript}</p>}
        {loading && <div className="loader"></div>} {/* Loading spinner */}
      </div>
      <div className='my-4 flex flex-col items-center'>
        {/* Chat log display */}
        {chatLog.map((item, index) => (
          <div key={index} className='flex flex-col items-justify'>
            <div className='flex items-center'>
              <img
                className='h-10 w-10 rounded-full mr-5'
                src='/icon.png'
                alt='icon'
                content='cover'
              />
              <p className='text-left-justify text-sm font-bold bot-response'>{item.message}</p>
            </div>
            <p className='text-justify text-sm mt-1 user-query'>{item.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
