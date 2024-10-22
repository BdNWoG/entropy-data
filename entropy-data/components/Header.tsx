// components/Header.tsx
const Header = () => {
    return (
    <header className="bg-panel text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="bg-borderBlue hover:bg-blue-600 px-4 py-2 rounded-md">
        Action
        </button>
    </header>
    );
};

export default Header;
