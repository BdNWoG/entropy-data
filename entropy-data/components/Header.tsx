// components/Header.tsx
const Header = () => {
    return (
        <header className="bg-panel text-white h-32 flex justify-between items-center p-6 shadow-lg">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <button className="bg-borderBlue hover:bg-blue-600 px-6 py-3 rounded-md">
            Action
        </button>
        </header>
    );
};

export default Header;
