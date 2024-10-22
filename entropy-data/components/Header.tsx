// components/Header.tsx
import { AiOutlineCopy, AiOutlineSave, AiOutlinePicture } from "react-icons/ai";
import { FiSettings, FiLogIn, FiStar } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";

const Header = () => {
    const actions = [
        { icon: AiOutlineCopy, label: "Copy" },
        { icon: AiOutlineSave, label: "Save" },
        { icon: AiOutlinePicture, label: "Add Logo" },
        { icon: FiSettings, label: "Change Theme" },
        { icon: MdColorLens, label: "Customize Colors" },
        { icon: FiLogIn, label: "Sign In" },
        { icon: FiStar, label: "Upgrade" },
    ];

    return (
        <header className="bg-panel text-white h-32 flex items-center p-6 shadow-lg">
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
        </header>
    );
};

export default Header;
