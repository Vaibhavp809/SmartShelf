import { useEffect, useMemo, useState } from "react";
import {
  fetchGenreRecommendations,
  fetchLibrary,
  fetchPopularBooks,
  fetchTopRatedBooks,
  searchBooks
} from "../api/client";
import HorizontalShelf from "../components/HorizontalShelf";
import { useAuth } from "../context/AuthContext";

function normalizeBook(book, fallbackCategory) {
  return {
    googleBookId: book.googleBookId || book.google_book_id || `${book.bookId || book.id}`,
    title: book.title,
    category: book.category || fallbackCategory || "General",
    authors: book.authors || book.reason || "Recommended for you",
    thumbnailUrl: book.thumbnailUrl || book.thumbnail_url
  };
}

export default function ForYouPage() {
  const { user } = useAuth();
  const [library, setLibrary] = useState([]);
  const [tailored, setTailored] = useState([]);
  const [genreRefresh, setGenreRefresh] = useState([]);
  const [mayTry, setMayTry] = useState([]);
  const [popularNow, setPopularNow] = useState([]);
  const [loading, setLoading] = useState(true);

  const dominantCategory = useMemo(() => {
    const counts = new Map();
    library.forEach((entry) => {
      const category = entry.book?.category;
      if (!category) return;
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return ranked[0]?.[0] || "Fiction";
  }, [library]);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      try {
        const libraryData = await fetchLibrary().catch(() => []);
        setLibrary(libraryData);

        const [
          tailoredData,
          genreRefreshData,
          mayTryData,
          topRatedData,
          popularData
        ] = await Promise.all([
          fetchGenreRecommendations(dominantCategory).catch(() => []),
          searchBooks(`${dominantCategory} books`, 0, 10).catch(() => []),
          searchBooks(`if you like ${dominantCategory} novels`, 0, 10).catch(() => []),
          fetchTopRatedBooks().catch(() => []),
          fetchPopularBooks().catch(() => [])
        ]);

        setTailored(
          tailoredData.length > 0
            ? tailoredData.map((book) => normalizeBook(book, dominantCategory))
            : genreRefreshData.map((book) => normalizeBook(book, dominantCategory))
        );
        setGenreRefresh(genreRefreshData.map((book) => normalizeBook(book, dominantCategory)));
        setMayTry(mayTryData.map((book) => normalizeBook(book, dominantCategory)));
        setPopularNow(
          [...topRatedData, ...popularData]
            .slice(0, 12)
            .map((book) => normalizeBook(book, book.category))
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [dominantCategory]);

  return (
    <main className="page">
      <section className="glass-panel recommendation-hero">
        <div className="recommendation-copy">
          <span className="eyebrow">Personalized Space</span>
          <h1>{user?.fullName}, your next shelf starts here.</h1>
          <p>
            SmartShelf is tracking your reading mood and building a richer discovery lane around
            <strong> {dominantCategory}</strong>.
          </p>
        </div>
        <div className="recommendation-meta">
          <div className="metric-tile">
            <strong>{library.length}</strong>
            <span>Books in your library</span>
          </div>
          <div className="metric-tile">
            <strong>{tailored.length}</strong>
            <span>Tailored picks ready</span>
          </div>
          <div className="metric-tile">
            <strong>{dominantCategory}</strong>
            <span>Your strongest genre signal</span>
          </div>
        </div>
      </section>

      {tailored.length > 0 && (
        <HorizontalShelf
          title={`Because You Like ${dominantCategory}`}
          description="Click any cover to jump into the full book detail view."
          books={tailored}
          actionRenderer={() => <span className="pill">Tailored</span>}
        />
      )}

      {mayTry.length > 0 && (
        <HorizontalShelf
          title="Books You May Want To Try"
          description="A broader lane of adjacent reads when you want to step slightly outside your usual shelf."
          books={mayTry}
          actionRenderer={() => <span className="pill">Try This</span>}
        />
      )}

      {genreRefresh.length > 0 && (
        <HorizontalShelf
          title={`${dominantCategory} Refresh`}
          description="Fresh genre-centered discoveries similar to what you already save and read."
          books={genreRefresh}
          actionRenderer={() => <span className="pill">Genre Match</span>}
        />
      )}

      {popularNow.length > 0 && (
        <HorizontalShelf
          title="Readers Are Loving"
          description="A polished blend of top-rated and popular books to keep your queue full."
          books={popularNow}
          actionRenderer={() => <span className="pill">Hot Now</span>}
        />
      )}

      {!loading && tailored.length === 0 && genreRefresh.length === 0 && mayTry.length === 0 && (
        <section className="glass-panel section-panel">
          <p className="empty-state">
            Add a few books to your library first, then this page will start shaping itself around your taste.
          </p>
        </section>
      )}
    </main>
  );
}
