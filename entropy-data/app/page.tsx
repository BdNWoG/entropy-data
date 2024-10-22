// app/page.tsx
import Header from "../components/Header";
import PlotPanel from "../components/PlotPanel";
import CSVPanel from "../components/CSVPanel";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow flex p-6 gap-6">
        <PlotPanel />
        <CSVPanel />
      </main>

      {/* Footer / Customization Panel */}
      <Footer />
    </div>
  );
}
