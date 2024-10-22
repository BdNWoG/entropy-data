// components/Footer.tsx
const Footer = () => {
    return (
        <footer className="bg-panel text-white h-64 p-8 shadow-lg">
        <h2 className="text-2xl mb-6">Customization</h2>
        <div className="flex gap-6">
            <button className="bg-borderBlue hover:bg-blue-600 px-6 py-3 rounded-md">
            Customize 1
            </button>
            <button className="bg-borderBlue hover:bg-blue-600 px-6 py-3 rounded-md">
            Customize 2
            </button>
        </div>
        </footer>
    );
};

export default Footer;