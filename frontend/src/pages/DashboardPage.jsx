import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchLibrary, removeLibraryEntry } from "../api/client";
import { useAuth } from "../context/AuthContext";

const shelves = ["ALL", "READ", "WISHLIST", "FAVORITE"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeShelf, setActiveShelf] = useState("ALL");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLibrary()
      .then((data) => {
        setEntries(data);
        const firstNonEmptyShelf = ["READ", "WISHLIST", "FAVORITE"].find((shelf) =>
          data.some((entry) => entry.status === shelf)
        );
        setActiveShelf(firstNonEmptyShelf || "ALL");
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleEntries = activeShelf === "ALL"
    ? entries
    : entries.filter((entry) => entry.status === activeShelf);

  const shelfCounts = {
    ALL: entries.length,
    READ: entries.filter((entry) => entry.status === "READ").length,
    WISHLIST: entries.filter((entry) => entry.status === "WISHLIST").length,
    FAVORITE: entries.filter((entry) => entry.status === "FAVORITE").length
  };

  const handleDelete = async (entryId) => {
    await removeLibraryEntry(entryId);
    setEntries((current) => current.filter((entry) => entry.entryId !== entryId));
  };

  return (
    <main className="page">
      <section className="glass-panel dashboard-banner">
        <span className="eyebrow">Your Reader Hub</span>
        <h1>{user?.fullName}'s dashboard</h1>
        <p>Organize your shelves, revisit saved books, and open any cover to jump back into the full book page.</p>
      </section>

      <section className="glass-panel section-panel">
        <div className="tab-row">
          {shelves.map((shelf) => (
            <button
              key={shelf}
              className={shelf === activeShelf ? "tab active" : "tab"}
              onClick={() => setActiveShelf(shelf)}
            >
              {shelf} ({shelfCounts[shelf]})
            </button>
          ))}
        </div>

        {visibleEntries.length > 0 ? (
          <div className="dashboard-book-grid">
            {visibleEntries.map((entry) => (
              <article key={entry.entryId} className="book-card dashboard-book-card">
                <Link to={`/books/${entry.book.googleBookId}`}>
                  <div className="book-cover-wrap">
                    <img
                      src={entry.book.thumbnailUrl || "https://placehold.co/320x480/160c2f/e3f4ff?text=SmartShelf"}
                      alt={entry.book.title}
                      className="book-cover"
                    />
                  </div>
                </Link>
                <div className="book-card-content">
                  <span className="eyebrow">{entry.status}</span>
                  <h3>{entry.book.title}</h3>
                  <p>{entry.book.authors}</p>
                  <div className="dashboard-card-actions">
                    <Link className="ghost-button" to={`/books/${entry.book.googleBookId}`}>Open</Link>
                    <button className="ghost-button" onClick={() => handleDelete(entry.entryId)}>Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          !loading && <p className="empty-state">This shelf is waiting for its first book.</p>
        )}
      </section>
    </main>
  );
}
