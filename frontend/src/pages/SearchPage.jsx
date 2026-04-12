import { useEffect, useRef, useState } from "react";
import { searchBooks } from "../api/client";
import BookCard from "../components/BookCard";

export default function SearchPage() {
  const [query, setQuery] = useState("fantasy");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  const loadBooks = async (reset = false) => {
    setLoading(true);
    const nextPage = reset ? 0 : page;
    const data = await searchBooks(query, nextPage, 12);
    setResults((current) => (reset ? data : [...current, ...data]));
    setHasMore(data.length === 12);
    setPage(nextPage + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadBooks(true);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadBooks();
      }
    }, { threshold: 0.4 });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, query]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(0);
    await loadBooks(true);
  };

  return (
    <main className="page">
      <section className="glass-panel search-header">
        <div>
          <span className="eyebrow">Google Books Search</span>
          <h1>Search and import your next favorite read</h1>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, author, or genre" />
          <button className="primary-button" type="submit">Search</button>
        </form>
      </section>

      <section className="book-grid">
        {results.map((book) => (
          <BookCard key={book.googleBookId} book={book} />
        ))}
      </section>

      <div ref={sentinelRef} className="load-sentinel">
        {loading ? "Loading more books..." : hasMore ? "Scroll for more" : "You reached the end"}
      </div>
    </main>
  );
}

