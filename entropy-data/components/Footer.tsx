// components/Footer.tsx
const Footer = () => {
    return (
        <footer className="bg-panel text-white p-6 shadow-lg">
        <h2 className="text-xl mb-4">Customization</h2>
        <div className="flex gap-4">
            <button className="bg-borderBlue hover:bg-blue-600 px-4 py-2 rounded-md">
            Customize 1
            </button>
            <button className="bg-borderBlue hover:bg-blue-600 px-4 py-2 rounded-md">
            Customize 2
            </button>
        </div>
        </footer>
    );
};

export default Footer;
