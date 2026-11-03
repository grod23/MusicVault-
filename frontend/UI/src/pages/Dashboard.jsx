import { useState } from "react";
import Header from "../Dashcomponents/Header";
import Sidebar from "../Dashcomponents/Sidebar";
import MusicPlayer from "../Dashcomponents/MusicPlayer";

function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");

  const sectionTitles = {
    home: "",
    liked: "",
    library: "",
    playlists: "",
  };

  return (
    <div className="dashboard-layout">
      <Header />

      <div className="dashboard-body">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="dashboard-main">
          <h1>{sectionTitles[activeSection]}</h1>


        </main>
      </div>
      <MusicPlayer />
    </div>
  );
}

export default Dashboard;