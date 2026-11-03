import { useState } from "react";
import Header from "../Dashcomponents/Header";
import Sidebar from "../Dashcomponents/Sidebar";
import MusicPlayer from "../Dashcomponents/MusicPlayer";
import LikedSongs from "../Dashcomponents/LikedSongs";

function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="dashboard-layout">
      <Header />

      <div className="dashboard-body">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="dashboard-main">
  {activeSection === "liked" && <LikedSongs />}
  {activeSection === "home" && <h1>Home</h1>}
  {activeSection === "library" && <h1>Your Library</h1>}
  {activeSection === "playlists" && <h1>Playlists</h1>}
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
}

export default Dashboard;