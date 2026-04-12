import { Link } from "react-router-dom";

export default function BookCard({ book, subtitle, action }) {
  return (
    <article className="book-card">
      <Link to={`/books/${book.googleBookId || book.google_book_id || book.bookId}`}>
        <div className="book-cover-wrap">
          <img
            src={book.thumbnailUrl || book.thumbnail_url || "https://placehold.co/320x480/160c2f/e3f4ff?text=SmartShelf"}
            alt={book.title}
            className="book-cover"
          />
        </div>
      </Link>
      <div className="book-card-content">
        <span className="eyebrow">{book.category || "Curated pick"}</span>
        <h3>{book.title}</h3>
        <p>{subtitle || book.authors}</p>
        {action}
      </div>
    </article>
  );
}

