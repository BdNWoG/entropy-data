// components/CSVPanel.tsx
const CSVPanel = () => {
    return (
        <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4">
        <h2 className="text-xl text-white mb-4">CSV Data</h2>
        <div className="h-full bg-black rounded-md flex items-center justify-center overflow-auto">
            <p className="text-white">[CSV Data Table]</p>
        </div>
        </div>
    );
};

export default CSVPanel;
