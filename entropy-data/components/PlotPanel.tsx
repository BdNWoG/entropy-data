// components/PlotPanel.tsx
const PlotPanel = () => {
    return (
        <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4">
        <h2 className="text-xl text-white mb-4">Plot</h2>
        <div className="h-full bg-black rounded-md flex items-center justify-center">
            <p className="text-white">[Plot Goes Here]</p>
        </div>
        </div>
    );
};

export default PlotPanel;
