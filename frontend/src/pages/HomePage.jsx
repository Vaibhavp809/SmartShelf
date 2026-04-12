import { useEffect, useState } from "react";
import {
  fetchGenreRecommendations,
  fetchLibrary,
  fetchPopularBooks,
  fetchTopRatedBooks,
  fetchTrending,
  searchBooks
} from "../api/client";
import HorizontalShelf from "../components/HorizontalShelf";
import { useAuth } from "../context/AuthContext";

function mapAnalyticsBooks(items, subtitleKey) {
  return items.map((item) => ({
    googleBookId: item.googleBookId,
    title: item.title,
    authors: subtitleKey === "reviewCount" ? `${item.reviewCount} interactions` : `${item.averageRating} avg rating`,
    category: item.category,
    thumbnailUrl: item.thumbnailUrl
  }));
}

function mapRecommendationBooks(items) {
  return items.map((item) => ({
    googleBookId: item.googleBookId,
    title: item.title,
    authors: item.reason,
    category: item.category,
    thumbnailUrl: item.thumbnailUrl
  }));
}

export default function HomePage() {
  const { token } = useAuth();
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const heroBooks = [...trending, ...popular].slice(0, 5);

  useEffect(() => {
    async function loadHome() {
      try {
        const [
          trendingData,
          popularData,
          topRatedData,
          trendingFallback,
          popularFallback,
          topRatedFallback
        ] = await Promise.all([
          fetchTrending().catch(() => []),
          fetchPopularBooks().catch(() => []),
          fetchTopRatedBooks().catch(() => []),
          searchBooks("award winning fiction", 0, 10).catch(() => []),
          searchBooks("popular mystery books", 0, 10).catch(() => []),
          searchBooks("top rated fantasy novels", 0, 10).catch(() => [])
        ]);

        setTrending(trendingData.length > 0 ? trendingData : trendingFallback);
        setPopular(popularData.length > 0 ? mapAnalyticsBooks(popularData, "reviewCount") : popularFallback);
        setTopRated(topRatedData.length > 0 ? mapAnalyticsBooks(topRatedData, "averageRating") : topRatedFallback);

        if (token) {
          const library = await fetchLibrary().catch(() => []);
          const favoriteCategory = library[0]?.book?.category;

          if (favoriteCategory) {
            const personalizedData = await fetchGenreRecommendations(favoriteCategory).catch(() => []);
            setPersonalized(
              personalizedData.length > 0
                ? mapRecommendationBooks(personalizedData)
                : await searchBooks(`${favoriteCategory} books`, 0, 10).catch(() => [])
            );
          } else {
            setPersonalized(await searchBooks("recommended books for avid readers", 0, 10).catch(() => []));
          }
        } else {
          setPersonalized([]);
        }
      } catch (error) {
        setTrending([]);
        setPopular([]);
        setTopRated([]);
        setPersonalized([]);
      }
    }

    loadHome();
  }, [token]);

  return (
    <main className="page page-home">
      <section className="hero-panel hero-showcase glass-panel">
        <div className="hero-copy">
          <span className="eyebrow">SmartShelf Experience</span>
          <h1>Your next bookshelf should feel alive.</h1>
          <p>
            Explore living shelves, save what matters, and unlock recommendations shaped by your own reading trail.
          </p>
          <div className="hero-stats">
            <div className="metric-tile">
              <strong>{trending.length || 10}+</strong>
              <span>Trending titles</span>
            </div>
            <div className="metric-tile">
              <strong>{popular.length || 12}</strong>
              <span>Reader hot picks</span>
            </div>
            <div className="metric-tile">
              <strong>{topRated.length || 20}</strong>
              <span>Top-rated discoveries</span>
            </div>
          </div>
        </div>
        <div className="hero-bookstage">
          <div className="hero-book-grid">
            {heroBooks.map((book, index) => (
              <article key={`${book.googleBookId}-${index}`} className={`hero-book-card hero-book-card-${index + 1}`}>
                <img
                  src={book.thumbnailUrl || "https://placehold.co/320x480/160c2f/e3f4ff?text=SmartShelf"}
                  alt={book.title}
                />
                <div className="hero-book-meta">
                  <span>{book.category}</span>
                  <strong>{book.title}</strong>
                </div>
              </article>
            ))}
          </div>
          <div className="hero-pulse">
            <div className="pulse-ring" />
            <div className="pulse-core">
              <span className="eyebrow">Readers love</span>
              <strong>Immersive shelves</strong>
            </div>
          </div>
        </div>
      </section>

      <HorizontalShelf
        title="Trending Books"
        description="A rolling front row of books gaining attention right now."
        books={trending}
      />

      <HorizontalShelf
        title="Popular With Readers"
        description="Books readers keep opening, saving, and talking about."
        books={popular}
      />

      <HorizontalShelf
        title="Top Rated Picks"
        description="Books earning standout praise across the shelf."
        books={topRated}
      />

      {personalized.length > 0 && (
        <HorizontalShelf
          title="Picked For Your Taste"
          description="A dynamic shelf that shifts as your own reading history grows."
          books={personalized}
        />
      )}
    </main>
  );
}
