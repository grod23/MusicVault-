import "./Sidebar.css";

function Sidebar({ activeSection, onSectionChange }) {
  const sections = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "liked", label: "Liked Songs", icon: "♥" },
    { id: "library", label: "Your Library", icon: "♫" },
    { id: "playlists", label: "Playlists", icon: "☷" },
  ];

  return (
    <aside className="dashboard-sidebar">
      <h3 className="sidebar-title">Your Music</h3>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`sidebar-button ${
              activeSection === section.id ? "active" : ""
            }`}
            onClick={() => onSectionChange(section.id)}
            aria-current={
              activeSection === section.id ? "page" : undefined
            }
          >
            <span className="sidebar-icon" aria-hidden="true">
              {section.icon}
            </span>
            <span>{section.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;