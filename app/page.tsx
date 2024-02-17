"use state" ;
import Image from 'next/image';
import { ThemeModeToggle } from './(chatting)/_components/themeModeToggle';
import Footer from './(chatting)/_components/footer';

export default function Home() {
  return (
    <section className="bg-white min-h-screen h-full dark:bg-gray-900">
      <div className="flex justify-between p-8">
        {/* logo */}
        <img className="h-20 w-40 rounded-full" src="/logo.png" alt="logo" />
        <ThemeModeToggle />
      </div>

      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-7xl dark:text-white">
          The future of <strong className="font-extrabold text-pink-600">mining</strong> <br />
          compliance is here. <strong className="leading-1 mt-1 text-4.5xl text-purple-600 underline underline-purple-600 ">Talk to us. </strong>.
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
          MiningNiti chatbot available 24/7 for stakeholders and customers which can answer all their queries regarding the rules, acts, and circulars.
        </p>

        {/* Add the Image component here */}
        <div className="flex mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Image
            className="w-1/2 h-auto" // Adjust the width as needed
            src="/Untitled-removebg-preview.png" // Replace with the actual path to your image file
            alt="Your Image"
            width={100} // Adjust the width based on your image dimensions
            height={850} // Adjust the height based on your image dimensions
          />

          {/* Start Chatting Button */}
          <a href="/chatting" className="inline-flex justify-center items-center py-3 px-5 text-base border border-pink-500 font-medium text-center rounded-lg text-pink-500 hover:text-white hover:bg-pink-500 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
            Start Chatting
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </a>
        </div>

        {/* Rest of the components */}
        {/* About */}
        <ProjectAbout />

        {/* Vision */}
        <ApproachOur />

        {/* Technologies Used */}
        <Technologies />

        {/* Team Details */}
        <TeamDetails />

        {/* Footer */}
        <Footer />
      </div>
    </section>
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
        <div className="px-4 mt-[12rem] mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
            <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase">Team Details </span>
            <div className="grid md:grid-cols-3  flex-wrap justify-center items-center mt-4 mx-[4rem] text-gray-500 sm:justify-between">
                <StatCard
                    name='Gavesh'
                    image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa0Mk1UasaChu-jfdvXtwjPM7d2_w7xhmO-w&usqp=CAU'
                />
                <StatCard
                    name='Milan'
                    image='\milan.png' />
                <StatCard
                    name='Abhilash'
                    image='\abhilash.png'
                />
                <StatCard
                    name='Khushal'
                    image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa0Mk1UasaChu-jfdvXtwjPM7d2_w7xhmO-w&usqp=CAU'
                />
                <StatCard
                    name='Somebody'
                    image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa0Mk1UasaChu-jfdvXtwjPM7d2_w7xhmO-w&usqp=CAU'
                />
                <StatCard
                    name='Somebody'
                    image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa0Mk1UasaChu-jfdvXtwjPM7d2_w7xhmO-w&usqp=CAU'
                />
            </div>
        </div>
    );
}

function ProjectAbout() {
    return (
        <div className='p-8'>
            <span className="font-semibold text-gray-700 uppercase">About Project </span>
            <p className='mt-4 bg-slate-800 text-gray-300 p-8 md:max-w-3xl md:flex md:justify-center md:mx-auto rounded-xl'>
            A Chatbot is a computer program that uses Artificial Intelligence (AI) and Natural Language Processing (NLP) to understand customer questions and automate responses to them, imitating human conversation. As of now, various Acts, Rules and Regulations, DGMS Circulars, CoI Proceedings, etc. are applicable to Mining industries. These are some of the Acts and Rules: The Coal Mines Act, 1952 Indian Explosives Act, 1884 Colliery Control Order, 2000 Colliery Control Rules, 2004 The Coal Mines Regulations, 2017 The Payment of Wages (Mines) Rules, 1956 Additionally, land-related laws i.e. CBA, LA, RandR related queries can also be incorporated to develop Robust Management Information System. Hence it is proposed to make a chatbot available 24/7 for stakeholders and customers which can answer all their queries regarding the rules, acts, and circulars.
            </p>
        </div>
    );
}
function ApproachOur() {
    return (
        <div className='p-8'>
            <span className="font-semibold text-gray-700 uppercase">About Project </span>
            <p className='mt-4 bg-slate-800 text-gray-300 p-8 md:max-w-3xl md:flex md:justify-center md:mx-auto rounded-xl'>
                Our Approach which we implemented with using right Technologies .
            </p>
        </div>
    );
}

function Technologies() {
    return (
        <div className="flex justify-between h-[12rem] w-auto p-8 mt-[2rem] items-center py-auto" >
            <div className="flex-col mr-12">
                <div className="mt-16 text-2xl text-start font-semibold dark:text-white mb-7 ">
                    Technologies Used in here
                </div>
                <p className='text-opacity-70 mt-1 text-left text-base '>We have used these technologies to build our product and achieve our goals</p>
            </div>

            <div className="flex mt-[4rem]">
                <SkillsTile
                    icon={
                        "https://cdn.iconscout.com/icon/free/png-256/react-1-282599.png"
                    }
                    type={"Web Library"}
                    skill={"React.js"}
                />
                <SkillsTile
                    icon= '\next.png'
                    type={"Full Stack "}
                    skill={"Next.js"}
                />
                <SkillsTile
                    icon={
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsZbdaPK52q0MClGcJozC5rcPwcRq54oTdVHVL_yGjnzD1DzZG76gVOLdvkHVhpSyZ95o&usqp=CAU"
                    }
                    type={"Back End"}
                    skill={"Node.js"}
                />
                <SkillsTile
                    icon={
                        "https://pbs.twimg.com/profile_images/1452637606559326217/GFz_P-5e_400x400.png"
                    }
                    type={"Back End"}
                    skill={"Django"}
                />

                <SkillsTile
                    icon={
                        "https://pbs.twimg.com/profile_images/1452637606559326217/GFz_P-5e_400x400.png"
                    }
                    type={"Back End"}
                    skill={"Python"}  
                />
                 <SkillsTile
                    icon={
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsZbdaPK52q0MClGcJozC5rcPwcRq54oTdVHVL_yGjnzD1DzZG76gVOLdvkHVhpSyZ95o&usqp=CAU"
                    }
                    type={"Back End"}
                    skill={"Node.js"}
                />
                  <SkillsTile
                    icon={
                        "https://pbs.twimg.com/profile_images/1452637606559326217/GFz_P-5e_400x400.png"
                    }
                    type={"Back End"}
                    skill={"Python"}  
                />
                  <SkillsTile
                    icon={
                        "https://pbs.twimg.com/profile_images/1452637606559326217/GFz_P-5e_400x400.png"
                    }
                    type={"Back End"}
                    skill={"Python"}  
                />
                 
            </div>
        </div>
        
    );
}


function SkillsTile({ skill, type, icon }: any) {
    return (
        <div className="items-center mr-10 text-center">
            <div className="flex-1 p-6 text-left bg-pink-500 rounded-full shadow-sm cursor-pointer hover:bg-pink-700 hover:text-white">
                <img className="w-10 h-10 rounded-full" src={icon} />
                <p className="w-10 mt-4 text-sm text-center text-gray-100">{type}</p>
            </div>
            <div className="mt-2">{skill}</div>
        </div>
    )
}
