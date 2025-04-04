// src/components/DashboardLayout.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date for "Member Since"
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm z-10">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 text-medical-600 lg:hidden focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-xl font-bold text-medical-800">NG-08</div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm">
              <span className="text-gray-600">Welcome,</span>{' '}
              <span className="font-medium">{currentUser?.name || 'User'}</span>
            </div>
            <div className="relative" ref={profileDropdownRef}>
              <button 
                className="p-1 rounded-full bg-medical-100 text-medical-600 hover:bg-medical-200 focus:outline-none"
                onClick={toggleProfileDropdown}
                aria-label="Open profile menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <NavLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </NavLink>
                  <NavLink to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-white border-r shadow-md z-20 w-64 flex-shrink-0 fixed lg:sticky top-0 h-full transition-transform duration-300 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="h-16 bg-medical-700 flex items-center px-6">
            <h2 className="text-white font-semibold">Dashboard</h2>
          </div>
          
          <nav className="px-2 py-4 h-[calc(100%-4rem)] overflow-y-auto">
            <ul className="space-y-1">
              {/* Dashboard link */}
              <li>
                <NavLink 
                  to="/dashboard" 
                  end
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 text-sm rounded-md ${
                      isActive 
                        ? 'bg-medical-100 text-medical-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </NavLink>
              </li>

              {/* Diagnosis link */}
              <li>
                <NavLink 
                  to="/diagnosis" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 text-sm rounded-md ${
                      isActive 
                        ? 'bg-medical-100 text-medical-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  X-Ray Diagnosis
                </NavLink>
              </li>

              {/* Medical Chat link */}
              <li>
                <NavLink 
                  to="/medical-chat" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 text-sm rounded-md ${
                      isActive 
                        ? 'bg-medical-100 text-medical-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Medical Assistant
                </NavLink>
              </li>

              {/* History link */}
              <li>
                <NavLink 
                  to="/history" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 text-sm rounded-md ${
                      isActive 
                        ? 'bg-medical-100 text-medical-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </NavLink>
              </li>

              {/* Profile link */}
              <li>
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 text-sm rounded-md ${
                      isActive 
                        ? 'bg-medical-100 text-medical-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </NavLink>
              </li>

              {/* Log out */}
              <li className="mt-auto">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired
};