"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ThemeModeToggle } from './(chatting)/_components/themeModeToggle';
import Footer from './(chatting)/_components/footer';
import Faq from "./(chatting)/_components/faq";
import { motion } from 'framer-motion';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  };

  const hoverEffect = {
    hover: {
      scale: 1.2, // Increased scale for more focus
      boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.3)", // More prominent shadow
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
        <NavBar />
      </motion.div>
      <section className="bg-white min-h-screen h-full dark:bg-gray-900 pt-20">
        <motion.div className="flex flex-row justify-between items-center p-8 space-x-4 flex-nowrap" initial="hidden" animate="visible" variants={sectionVariants}>
          {/* logo */}
          <motion.img
            className="h-20 w-40 rounded-full"
            src="/logo.png"
            alt="logo"
            variants={hoverEffect}
            whileHover="hover"
          />
          
          {/* Real-time Clock */}
          <motion.div
            className="text-2xl sm:text-5xl font-extrabold tracking-widest leading-tight text-indigo-700 md:text-4xl lg:text-2xl dark:text-indigo-300"
            suppressHydrationWarning
            variants={hoverEffect}
            whileHover="hover"
          >
            {currentTime.toLocaleTimeString()}
          </motion.div>

          <ThemeModeToggle />
        </motion.div>

        <motion.div className="py-2 px-4 sm:px-8 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12" initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.h1
            className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-7xl dark:text-white"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            The future of <strong className="font-extrabold text-pink-600">mining</strong> <br />
            compliance is here. <strong className="leading-1 mt-1 text-4.5xl text-purple-600 underline underline-purple-600">Talk to us.</strong>
          </motion.h1>
          <p className="mb-8 text-base sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-4 xl:px-48 dark:text-gray-400">
            MiningNiti chatbot available 24/7 for stakeholders and customers which can answer all their queries regarding the rules, acts, and circulars.
          </p>

          <div className="flex flex-col items-center mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-5">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="mb-4 sm:mb-0" // Add margin-bottom for spacing
            >
             <Image
                className="h-50" // Adjust the width as needed
                src="/Untitled-removebg-preview.png" // Replace with the actual path to your image file
                alt="Your Image"
                width={200} // Adjust the width based on your image dimensions
                height={400} // Adjust the height based on your image dimensions
              />
            </motion.div>

            {/* Start Chatting Button */}
            <motion.a
              href="/chatting"
              className="inline-flex justify-center items-center py-3 px-3 text-base border border-pink-500 font-medium text-center rounded-lg text-pink-500 hover:text-white hover:bg-pink-500 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900 transition-colors duration-300"
              variants={sectionVariants}
              whileHover="hover"
            >
              Start Chatting
              <svg className="h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.29 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"></path>
              </svg>
            </motion.a>
          </div>

          {/* Rest of the components */}
          {/* About */}
          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <ProjectAbout sectionVariants={sectionVariants} />
          </motion.div>

          {/* Vision */}
          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <ApproachOur sectionVariants={sectionVariants} />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <Faq />
          </motion.div>

          {/* Technologies Used */}
          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <Technologies sectionVariants={sectionVariants} />
          </motion.div>

          {/* Team Details */}
          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <TeamDetails />
          </motion.div>

          {/* Footer */}
          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <Footer />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-purple-600 text-white p-5 flex justify-between items-center fixed top-0 left-0 right-0 z-50 h-16">
      <a href="/"><img className="h-8 w-25 rounded-full" src="/icon.png" alt="logo" /></a> 
      
      <div className="hidden sm:flex flex-row space-x-4">
        <a href="/about" className="px-4 py-2 hover:underline">About Us</a>
        <a href="/services" className="px-4 py-2 hover:underline">Services</a>
        <a href="/contact" className="px-4 py-2 hover:underline">Contact Us</a>
        <a href="/chatting" className="px-4 py-2 bg-pink-500 rounded hover:bg-pink-700 transition-colors">Get Started</a>
      </div>

      <div className="flex sm:hidden">
        <button onClick={toggleMenu} className="text-white focus:outline-none">
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          )}
        </button>
      </div>

      <div className={`flex-col sm:hidden ${menuOpen ? 'flex' : 'hidden'} absolute top-16 right-0 bg-purple-600 w-full`}>
        <a href="/about" className="px-4 py-2 hover:underline">About Us</a>
        <a href="/services" className="px-4 py-2 hover:underline">Services</a>
        <a href="/contact" className="px-4 py-2 hover:underline">Contact Us</a>
        <a href="/chatting" className="px-4 py-2 bg-pink-500 rounded hover:bg-pink-700 transition-colors">Get Started</a>
      </div>
    </nav>
  );
}

function StatCard({ name, image }: any) {
  return (
    <div className="flex flex-col m-4 justify-start items-center">
      <img className="w-24 h-24 rounded-full shadow-lg" src={image} alt="Bonnie image" />
      <h5 className="my-2 text-gray-700 font-medium text-base dark:text-gray-300">{name}</h5>
    </div>
  );
}

function TeamDetails() {
  return (
    <div className="px-4 mt-12 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
      <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase">Team Details </span>
      <div className="grid grid-cols-2 md:grid-cols-3 flex-wrap justify-center items-center mt-4 mx-4 text-gray-500 sm:justify-between">
        <StatCard
          name='Gavesh'
          image='/gavesh.png'
        />
        <StatCard
          name='Milan'
          image='/milan.png'
        />
        <StatCard
          name='Abhilash'
          image='/abhilash.png'
        />
        <StatCard
          name='Khushal'
          image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo_F_Ml2vnMrqz3vLOlvX5Xl5g3XqXB4RbWg&usqp=CAU'
        />
        <StatCard
          name='Avadhi'
          image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwqXZQe9Jpb0od0Fdx4HG6oZStieOnD8AFmQ&usqp=CAU'
        />
        <StatCard
          name='Khushbu'
          image='/rupali.jpg'
        />
      </div>
    </div>
  );
}

function ProjectAbout({ sectionVariants }:any) {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-screen-lg py-8 px-4 mx-auto lg:py-16 lg:px-6">
        <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            About the Project
          </h2>
        </motion.div>
        <p className="mb-8 font-light text-gray-500 lg:text-xl dark:text-gray-400">
          MiningNiti is a state-of-the-art chatbot designed to revolutionize mining compliance. With our innovative solution, stakeholders and customers have access to a reliable source of information, 24/7, ensuring they stay updated with the latest rules, acts, and circulars in the mining sector.
        </p>
      </div>
    </section>
  );
}

function ApproachOur({ sectionVariants }:any) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-screen-lg py-8 px-4 mx-auto lg:py-16 lg:px-6">
        <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Our Vision
          </h2>
        </motion.div>
        <p className="mb-8 font-light text-gray-500 lg:text-xl dark:text-gray-400">
          We aim to lead the mining industry towards a more compliant, efficient, and transparent future. Our vision is to empower every stakeholder with the information they need to make informed decisions, ensuring the highest standards of compliance and operational excellence.
        </p>
      </div>
    </section>
  );
}

function Technologies({ sectionVariants }:any) {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-screen-lg py-8 px-4 mx-auto lg:py-16 lg:px-6">
        <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Technologies Used
          </h2>
        </motion.div>
        <ul className="list-disc list-inside">
          <li className="font-light text-gray-500 lg:text-xl dark:text-gray-400">Next.js</li>
          <li className="font-light text-gray-500 lg:text-xl dark:text-gray-400">FAISS</li>
          <li className="font-light text-gray-500 lg:text-xl dark:text-gray-400">Direct Preference Optimization (DPO)</li>
          <li className="font-light text-gray-500 lg:text-xl dark:text-gray-400">Retrival Augmentated generation (RAG)</li>
          <li className="font-light text-gray-500 lg:text-xl dark:text-gray-400">LangChain</li>
        </ul>
      </div>
    </section>
  );
}
