// components/Header.tsx
"use client";

import { useState } from "react";
import { AiOutlineCopy, AiOutlineSave, AiOutlinePicture } from "react-icons/ai";
import { FiSettings, FiLogIn, FiStar } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";

const Header = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false); // State to toggle popup

    const actions = [
        { icon: AiOutlineCopy, label: "Copy" },
        { icon: AiOutlineSave, label: "Save" },
        { icon: AiOutlinePicture, label: "Add Logo" },
        { icon: FiSettings, label: "Change Theme" },
        { icon: MdColorLens, label: "Customize Colors" },
        { icon: FiLogIn, label: "Sign In" },
        { icon: FiStar, label: "Upgrade" },
    ];

    const toggleProfilePopup = () => {
        setIsProfileOpen(!isProfileOpen); // Toggle the profile popup
    };

    return (
        <header className="bg-panel text-white h-32 flex items-center p-6 shadow-lg relative">
            {/* Dashboard Text on the Left */}
            <div className="text-3xl font-semibold mr-auto">Dashboard</div>

            {/* Action Buttons in the Center */}
            <div className="flex flex-grow justify-around items-center gap-4">
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-center border-2 border-borderBlue rounded-lg w-28 h-28 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        <action.icon className="h-8 w-8 text-borderBlue mb-2" />
                        <span className="text-sm text-center">{action.label}</span>
                    </div>
                ))}
            </div>

            {/* Clickable Profile Picture on the Right */}
            <div className="ml-6 relative">
                <button
                    onClick={toggleProfilePopup}
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:scale-105 transition-transform"
                >
                    <img
                        src="https://via.placeholder.com/150"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </button>

                {/* Profile Popup */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg p-4 z-50">
                        <p className="text-lg font-semibold mb-2">John Doe</p>
                        <p className="text-sm mb-4">johndoe@example.com</p>
                        <button
                            className="w-full bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 transition"
                            onClick={() => alert("Logging out...")}
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
