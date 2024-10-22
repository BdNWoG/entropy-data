// app/page.tsx (for App Router) or pages/index.tsx (for Pages Router)
export default function Home() {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header Bar */}
      <header className="bg-panel text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="bg-borderBlue hover:bg-blue-600 px-4 py-2 rounded-md">
          Action
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex p-6 gap-6">
        {/* Left Panel (Plot Area) */}
        <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 h-[500px]">
          <h2 className="text-xl text-white mb-4">Plot</h2>
          <div className="h-full bg-black rounded-md flex items-center justify-center">
            <p className="text-white">[Plot Goes Here]</p>
          </div>
        </div>

        {/* Right Panel (CSV Data) */}
        <div className="flex-1 bg-panel border-2 border-borderBlue rounded-xl shadow-lg p-4 h-[500px]">
          <h2 className="text-xl text-white mb-4">CSV Data</h2>
          <div className="h-full bg-black rounded-md flex items-center justify-center overflow-auto">
            <p className="text-white">[CSV Data Table]</p>
          </div>
        </div>
      </main>

      {/* Footer Panel (Customization Panel) */}
      <footer className="bg-panel text-white p-4 shadow-lg">
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
    </div>
  );
}
