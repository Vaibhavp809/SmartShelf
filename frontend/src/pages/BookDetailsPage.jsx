import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addToLibrary,
  fetchAlsoLiked,
  fetchBookDetails,
  fetchLibrary,
  fetchReviews,
  importBook,
  submitReview
} from "../api/client";
import HorizontalShelf from "../components/HorizontalShelf";
import { useAuth } from "../context/AuthContext";

function formatDescription(description) {
  if (!description) {
    return [];
  }

  const prepared = description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?p>/gi, "");

  const parser = new DOMParser();
  const doc = parser.parseFromString(prepared, "text/html");
  const text = doc.body.textContent || "";

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function BookDetailsPage() {
  const { googleBookId } = useParams();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [shelfStatus, setShelfStatus] = useState([]);
  const descriptionBlocks = formatDescription(book?.description);

  useEffect(() => {
    fetchBookDetails(googleBookId).then(setBook);
  }, [googleBookId]);

  useEffect(() => {
    if (!book?.id) {
      return;
    }

    fetchReviews(book.id).then(setReviews);
    fetchAlsoLiked(book.id).then(setRelated).catch(() => setRelated([]));
    fetchLibrary()
      .then((entries) => {
        const matching = entries
          .filter((entry) => entry.book.id === book.id)
          .map((entry) => entry.status);
        setShelfStatus(matching);
      })
      .catch(() => setShelfStatus([]));
  }, [book]);

  const ensureImported = async () => {
    const imported = await importBook(googleBookId);
    setBook(imported);
    return imported;
  };

  const handleShelfAction = async (status) => {
    setActionMessage("");
    setActionError("");
    try {
      const imported = book?.id ? book : await ensureImported();
      await addToLibrary({ bookId: imported.id, status });
      setShelfStatus((current) => current.includes(status) ? current : [...current, status]);
      setActionMessage(
        status === "READ"
          ? "Added to your Read shelf."
          : status === "FAVORITE"
            ? "Added to your Favorites shelf."
            : "Added to your Wishlist."
      );
    } catch (error) {
      if (error.response?.data?.message === "Book already exists in this shelf") {
        setShelfStatus((current) => current.includes(status) ? current : [...current, status]);
        setActionError(`This book is already in your ${status.toLowerCase()} shelf. Check your dashboard.`);
      } else {
        setActionError(error.response?.data?.message || "That shelf action could not be completed.");
      }
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setActionMessage("");
    setActionError("");
    try {
      const imported = book?.id ? book : await ensureImported();
      const saved = await submitReview({
        bookId: imported.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      setReviews((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setReviewForm({ rating: 5, comment: "" });
      setActionMessage("Your review has been published.");
    } catch (error) {
      setActionError(error.response?.data?.message || "Your review could not be saved.");
    }
  };

  if (!book) {
    return <main className="page">Loading book details...</main>;
  }

  return (
    <main className="page">
      <section className="book-hero glass-panel">
        <img
          src={book.thumbnailUrl || "https://placehold.co/320x480/160c2f/e3f4ff?text=SmartShelf"}
          alt={book.title}
          className="detail-cover"
        />
        <div className="detail-copy">
          <span className="eyebrow">{book.category || "General"}</span>
          <h1>{book.title}</h1>
          <p className="detail-meta">{book.authors}</p>
          <div className="detail-description">
            {descriptionBlocks.length > 0 ? (
              descriptionBlocks.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p>No description available from Google Books.</p>
            )}
          </div>
          <div className="button-row">
            <button
              className="primary-button"
              onClick={() => handleShelfAction("WISHLIST")}
              disabled={shelfStatus.includes("WISHLIST")}
            >
              {shelfStatus.includes("WISHLIST") ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <button
              className="ghost-button"
              onClick={() => handleShelfAction("READ")}
              disabled={shelfStatus.includes("READ")}
            >
              {shelfStatus.includes("READ") ? "Already Read" : "Mark as Read"}
            </button>
            <button
              className="ghost-button"
              onClick={() => handleShelfAction("FAVORITE")}
              disabled={shelfStatus.includes("FAVORITE")}
            >
              {shelfStatus.includes("FAVORITE") ? "In Favorites" : "Favorite"}
            </button>
            {book.previewLink && <a className="ghost-button" href={book.previewLink} target="_blank" rel="noreferrer">Preview</a>}
          </div>
          {actionMessage && <p className="success-text">{actionMessage}</p>}
          {actionError && <p className="error-text">{actionError}</p>}
        </div>
      </section>

      <section className="glass-panel review-form-panel">
        <div>
          <span className="eyebrow">Share Your Take</span>
          <h2>Rate and review this book</h2>
        </div>
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <select value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
          </select>
          <textarea
            value={reviewForm.comment}
            onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
            placeholder="What worked for you? What surprised you?"
            rows="4"
          />
          <button className="primary-button" type="submit">Publish Review</button>
        </form>
      </section>

      <section className="review-list">
        <div className="section-header">
          <div>
            <span className="eyebrow">Community Notes</span>
            <h2>Reader reviews</h2>
          </div>
        </div>
        <div className="review-stack">
          {reviews.map((review) => (
            <article key={review.id} className="glass-panel review-card">
              <div className="review-header">
                <strong>{review.reviewerName}</strong>
                <span>{review.rating}/5</span>
              </div>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <HorizontalShelf
          title="Readers Also Liked"
          description="JDBC-powered collaborative recommendations based on overlapping high ratings."
          books={related}
        />
      )}
    </main>
  );
}
