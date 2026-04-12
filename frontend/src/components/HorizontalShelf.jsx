import BookCard from "./BookCard";

export default function HorizontalShelf({ title, description, books, actionRenderer }) {
  return (
    <section className="shelf-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">Discover</span>
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      <div className="horizontal-shelf">
        {books.map((book) => (
          <BookCard
            key={`${title}-${book.googleBookId || book.bookId || book.id}`}
            book={book}
            action={actionRenderer ? actionRenderer(book) : null}
          />
        ))}
      </div>
    </section>
  );
}
