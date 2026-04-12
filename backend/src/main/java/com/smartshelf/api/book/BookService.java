package com.smartshelf.api.book;

import com.smartshelf.api.common.ApiException;
import com.smartshelf.api.review.ReviewRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final GoogleBooksClient googleBooksClient;
    private final ReviewRepository reviewRepository;

    public BookService(BookRepository bookRepository, GoogleBooksClient googleBooksClient, ReviewRepository reviewRepository) {
        this.bookRepository = bookRepository;
        this.googleBooksClient = googleBooksClient;
        this.reviewRepository = reviewRepository;
    }

    public List<BookDto> searchBooks(String query, int page, int size) {
        GoogleBooksResponse response = googleBooksClient.search(query, page * size, size);
        if (response == null || response.items() == null) {
            return List.of();
        }
        return response.items().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BookDto getBookByGoogleId(String googleBookId) {
        Optional<Book> savedBook = bookRepository.findByGoogleBookId(googleBookId);
        if (savedBook.isPresent()) {
            return toDto(savedBook.get());
        }
        return toDto(googleBooksClient.getByGoogleId(googleBookId));
    }

    public BookDto importBook(String googleBookId) {
        return bookRepository.findByGoogleBookId(googleBookId)
                .map(this::toDto)
                .orElseGet(() -> {
                    GoogleBooksResponse.GoogleBookItem item = googleBooksClient.getByGoogleId(googleBookId);
                    Book book = mapToEntity(item);
                    return toDto(bookRepository.save(book));
                });
    }

    public List<BookDto> trendingBooks() {
        return reviewRepository.findTopRatedBooks(PageRequest.of(0, 10)).stream()
                .map(this::toDto)
                .toList();
    }

    public Book requireBook(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));
    }

    private BookDto toDto(GoogleBooksResponse.GoogleBookItem item) {
        GoogleBooksResponse.VolumeInfo volumeInfo = item.volumeInfo();
        String authors = volumeInfo.authors() == null ? "Unknown" : String.join(", ", volumeInfo.authors());
        String category = volumeInfo.categories() == null || volumeInfo.categories().isEmpty() ? "General" : volumeInfo.categories().get(0);
        String thumbnail = volumeInfo.imageLinks() == null ? null :
                (volumeInfo.imageLinks().thumbnail() != null ? volumeInfo.imageLinks().thumbnail() : volumeInfo.imageLinks().smallThumbnail());
        return new BookDto(
                null,
                item.id(),
                volumeInfo.title(),
                authors,
                category,
                volumeInfo.description(),
                thumbnail,
                volumeInfo.previewLink(),
                volumeInfo.publishedDate(),
                null,
                null
        );
    }

    private BookDto toDto(Book book) {
        Double averageRating = reviewRepository.findAverageRatingByBookId(book.getId()).orElse(0.0);
        Long ratingsCount = reviewRepository.countByBookId(book.getId());
        return new BookDto(
                book.getId(),
                book.getGoogleBookId(),
                book.getTitle(),
                book.getAuthors(),
                book.getCategory(),
                book.getDescription(),
                book.getThumbnailUrl(),
                book.getPreviewLink(),
                book.getPublishedDate(),
                averageRating,
                ratingsCount
        );
    }

    private Book mapToEntity(GoogleBooksResponse.GoogleBookItem item) {
        GoogleBooksResponse.VolumeInfo volumeInfo = item.volumeInfo();
        if (volumeInfo == null || volumeInfo.title() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Book payload is incomplete");
        }

        Book book = new Book();
        book.setGoogleBookId(item.id());
        book.setTitle(volumeInfo.title());
        book.setAuthors(volumeInfo.authors() == null ? "Unknown" : String.join(", ", volumeInfo.authors()));
        book.setCategory(volumeInfo.categories() == null || volumeInfo.categories().isEmpty() ? "General" : volumeInfo.categories().get(0));
        book.setDescription(volumeInfo.description());
        if (volumeInfo.imageLinks() != null) {
            book.setThumbnailUrl(volumeInfo.imageLinks().thumbnail() != null ? volumeInfo.imageLinks().thumbnail() : volumeInfo.imageLinks().smallThumbnail());
        }
        book.setPreviewLink(volumeInfo.previewLink());
        book.setPublishedDate(volumeInfo.publishedDate());
        return book;
    }
}

