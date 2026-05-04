import { useEffect, useState } from "react";
import { fetchGenreRecommendations, fetchLibrary, removeLibraryEntry, searchBooks } from "../api/client";
import HorizontalShelf from "../components/HorizontalShelf";
import { useAuth } from "../context/AuthContext";

const shelves = ["ALL", "READ", "WISHLIST", "FAVORITE"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeShelf, setActiveShelf] = useState("ALL");
  const [entries, setEntries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationLabel, setRecommendationLabel] = useState("Genre-driven recommendations");

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

  useEffect(() => {
    const visibleEntries = activeShelf === "ALL"
      ? entries
      : entries.filter((entry) => entry.status === activeShelf);
    const currentCategory = visibleEntries[0]?.book?.category;
    if (!currentCategory) {
      setRecommendations([]);
      return;
    }
    fetchGenreRecommendations(currentCategory)
      .then(async (data) => {
        if (data.length > 0) {
          setRecommendationLabel(`Because you like ${currentCategory}`);
          setRecommendations(data);
          return;
        }

        const fallback = await searchBooks(`${currentCategory} books`, 0, 8).catch(() => []);
        setRecommendationLabel(`Fresh picks in ${currentCategory}`);
        setRecommendations(
          fallback.map((book) => ({
            bookId: book.id || book.googleBookId,
            title: book.title,
            reason: `Trending around ${book.category || currentCategory}`,
            score: "New",
            googleBookId: book.googleBookId,
            category: book.category || currentCategory,
            thumbnailUrl: book.thumbnailUrl,
            authors: book.authors
          }))
        );
      })
      .catch(async () => {
        const fallback = await searchBooks(`${currentCategory} books`, 0, 8).catch(() => []);
        setRecommendationLabel(`Fresh picks in ${currentCategory}`);
        setRecommendations(
          fallback.map((book) => ({
            bookId: book.id || book.googleBookId,
            title: book.title,
            reason: `Trending around ${book.category || currentCategory}`,
            score: "New",
            googleBookId: book.googleBookId,
            category: book.category || currentCategory,
            thumbnailUrl: book.thumbnailUrl,
            authors: book.authors
          }))
        );
      });
  }, [entries, activeShelf]);

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
        <p>Keep shelves organized, revisit activity, and surface fresh reads based on your current taste.</p>
      </section>

      <section className="dashboard-layout">
        <div className="glass-panel section-panel">
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

          <div className="dashboard-list">
            {visibleEntries.map((entry) => (
              <article key={entry.entryId} className="dashboard-item">
                <div>
                  <span className="eyebrow">{entry.status}</span>
                  <h3>{entry.book.title}</h3>
                  <p>{entry.book.authors}</p>
                </div>
                <button className="ghost-button" onClick={() => handleDelete(entry.entryId)}>Remove</button>
              </article>
            ))}
            {!loading && visibleEntries.length === 0 && <p className="empty-state">This shelf is waiting for its first book.</p>}
          </div>
        </div>

        <div className="glass-panel section-panel">
          <span className="eyebrow">For You</span>
          <h2>{recommendationLabel}</h2>
          {recommendations.length > 0 ? (
            <HorizontalShelf
              title={recommendationLabel}
              description="Open any cover to jump straight into the full book details page."
              books={recommendations.map((item) => ({
                googleBookId: item.googleBookId,
                title: item.title,
                category: item.category,
                authors: item.reason || item.authors,
                thumbnailUrl: item.thumbnailUrl
              }))}
              actionRenderer={(book) => <span className="pill">{book.authors?.startsWith("Trending") ? "Genre Match" : "For You"}</span>}
            />
          ) : (
            <p className="empty-state">Add books to a shelf first, then SmartShelf will start tailoring picks.</p>
          )}
        </div>
      </section>
    </main>
  );
}
