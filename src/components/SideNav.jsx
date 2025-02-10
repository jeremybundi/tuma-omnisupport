'use client';
import { useState } from 'react';

import { usePathname } from 'next/navigation';

import Image from 'next/image';
import Link from 'next/link';
import logo from '../../public/images/logo.png';
import set from '../../public/images/settings.png';
import User from './User';

export default function SideNav() {
  const pathname = usePathname(); // Get current route
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  return (
    <div className="w-full h-screen font-poppins  px-4 pt-8 bg-blue-600 text-white flex flex-col">
      <div className="flex justify-start mb-16">
        <Image src={logo} alt="Logo" width={40} height={24} />
        <div className="font-semibold text-2xl font-lufga mt-2 ml-3">
          Omnisupport
        </div>
      </div>

      <div className="relative group ">
        <Link href="/">
          {' '}
          {/* Link to the homepage */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`group flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 transition duration-300 ease-in-out 
              ${pathname === '/' ? 'bg-gray-200 text-blue-600' : 'hover:bg-[#F3F5F8] hover:text-blue-600'}`}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-4 font-bold"
            >
              <path
                d="M9.06261 10C9.06261 10.2486 9.16138 10.4871 9.3372 10.6629C9.51301 10.8387 9.75147 10.9375 10.0001 10.9375C10.2488 10.9375 10.4872 10.8387 10.663 10.6629C10.8388 10.4871 10.9376 10.2486 10.9376 10C10.9376 9.75136 10.8388 9.5129 10.663 9.33709C10.4872 9.16127 10.2488 9.0625 10.0001 9.0625C9.75147 9.0625 9.51301 9.16127 9.3372 9.33709C9.16138 9.5129 9.06261 9.75136 9.06261 10ZM12.9689 10C12.9689 10.2486 13.0676 10.4871 13.2434 10.6629C13.4193 10.8387 13.6577 10.9375 13.9064 10.9375C14.155 10.9375 14.3935 10.8387 14.5693 10.6629C14.7451 10.4871 14.8439 10.2486 14.8439 10C14.8439 9.75136 14.7451 9.5129 14.5693 9.33709C14.3935 9.16127 14.155 9.0625 13.9064 9.0625C13.6577 9.0625 13.4193 9.16127 13.2434 9.33709C13.0676 9.5129 12.9689 9.75136 12.9689 10ZM5.15636 10C5.15636 10.2486 5.25513 10.4871 5.43095 10.6629C5.60676 10.8387 5.84522 10.9375 6.09386 10.9375C6.3425 10.9375 6.58096 10.8387 6.75677 10.6629C6.93259 10.4871 7.03136 10.2486 7.03136 10C7.03136 9.75136 6.93259 9.5129 6.75677 9.33709C6.58096 9.16127 6.3425 9.0625 6.09386 9.0625C5.84522 9.0625 5.60676 9.16127 5.43095 9.33709C5.25513 9.5129 5.15636 9.75136 5.15636 10ZM18.0704 6.60938C17.629 5.56055 16.9962 4.61914 16.1896 3.81055C15.3886 3.00665 14.4377 2.36764 13.3907 1.92969C12.3165 1.47852 11.1759 1.25 10.0001 1.25H9.96105C8.77745 1.25586 7.63097 1.49023 6.55285 1.95117C5.51488 2.39362 4.57291 3.03376 3.77941 3.83594C2.98058 4.64258 2.35363 5.58008 1.92003 6.625C1.47081 7.70703 1.24425 8.85742 1.25011 10.041C1.25674 11.3974 1.57763 12.7338 2.18761 13.9453V16.9141C2.18761 17.1523 2.28227 17.3809 2.45076 17.5494C2.61925 17.7178 2.84777 17.8125 3.08605 17.8125H6.05675C7.26826 18.4225 8.60466 18.7434 9.96105 18.75H10.0021C11.172 18.75 12.3068 18.5234 13.3751 18.0801C14.4168 17.6474 15.3641 17.0158 16.1642 16.2207C16.9708 15.4219 17.6056 14.4883 18.0489 13.4473C18.5099 12.3691 18.7443 11.2227 18.7501 10.0391C18.756 8.84961 18.5255 7.69531 18.0704 6.60938ZM15.1193 15.1641C13.7501 16.5195 11.9337 17.2656 10.0001 17.2656H9.96691C8.78917 17.2598 7.61925 16.9668 6.58605 16.416L6.42199 16.3281H3.67199V13.5781L3.5841 13.4141C3.03331 12.3809 2.74035 11.2109 2.73449 10.0332C2.72667 8.08594 3.47081 6.25781 4.83605 4.88086C6.19933 3.50391 8.0216 2.74219 9.96886 2.73438H10.0021C10.9786 2.73438 11.9259 2.92383 12.8185 3.29883C13.6896 3.66406 14.4708 4.18945 15.1427 4.86133C15.8126 5.53125 16.34 6.31445 16.7052 7.18555C17.0841 8.08789 17.2735 9.04492 17.2696 10.0332C17.2579 11.9785 16.4943 13.8008 15.1193 15.1641Z"
                fill="#101820"
                stroke="white"
                strokeWidth="1.5"
                className={`transition duration-300 ${
                  pathname === '/'
                    ? 'stroke-blue-600'
                    : 'group-hover:stroke-blue-600'
                }`}
              />
            </svg>
            <span className="text-xl font-medium">All Messages</span>
          </button>
        </Link>
        {/* Dropdown Links */}
        {isDropdownOpen && (
          <div className=" text-black rounded-lg mt-2 py-2 ml-8  w-44">
            <Link
              href="/in-app"
              className="block text-white font-medium hover:text-blue-600 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              In-app
            </Link>
            <Link
              href="/email"
              className="block px-4 py-2 text-white font-medium hover:text-blue-600 rounded-md hover:bg-gray-200"
            >
              Email
            </Link>
            <Link
              href="/whatsapp"
              className="block px-4 py-2 text-white font-medium hover:text-blue-600 rounded-md hover:bg-gray-200"
            >
              WhatsApp
            </Link>
            <Link
              href="/app-store"
              className="block px-4 py-2 text-white font-medium hover:text-blue-600 rounded-md hover:bg-gray-200"
            >
              App Store
            </Link>
            <Link
              href="/play-store"
              className="block px-4 py-2 text-white font-medium hover:text-blue-600 rounded-md hover:bg-gray-200"
            >
              Play Store
            </Link>
          </div>
        )}

        <Link href="/">
          <button className="flex items-center pl-4 pr-12 py-2 mt-2 rounded-lg  border-white text-white transition duration-300   ease-in-out hover:bg-white hover:border-blue-600 hover:text-blue-600">
            {/* SVG Settings Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-4 transition duration-300 ease-in-out"
            >
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path>
              <path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="M6.34 17.66l-1.41 1.41"></path>
              <path d="M19.07 4.93l-1.41 1.41"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>

            {/* Settings Text */}
            <span className="text-2xl font-medium transition duration-300 ease-in-out">
              Settings
            </span>
          </button>
        </Link>
      </div>
      {/* Bottom Section */}
      <div className="mt-auto mb-4">
        <User />
      </div>
    </div>
  );
}
