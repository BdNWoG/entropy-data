// components/PlotPanel.tsx
const PlotPanel = () => {
    return (
        <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 box-border">
        <div className="h-full bg-black rounded-md overflow-hidden flex items-center justify-center box-border">
            <p className="text-white">[Plot Goes Here]</p>
        </div>
        </div>
    );
};

export default PlotPanel;
