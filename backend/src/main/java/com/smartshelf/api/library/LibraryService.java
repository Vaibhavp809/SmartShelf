package com.smartshelf.api.library;

import com.smartshelf.api.auth.User;
import com.smartshelf.api.auth.UserRepository;
import com.smartshelf.api.book.Book;
import com.smartshelf.api.book.BookDto;
import com.smartshelf.api.book.BookService;
import com.smartshelf.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LibraryService {

    private final UserBookRepository userBookRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    public LibraryService(UserBookRepository userBookRepository, UserRepository userRepository, BookService bookService) {
        this.userBookRepository = userBookRepository;
        this.userRepository = userRepository;
        this.bookService = bookService;
    }

    @Transactional
    public LibraryEntryDto addToLibrary(String email, LibraryRequest request) {
        User user = requireUser(email);
        Book book = bookService.requireBook(request.bookId());

        userBookRepository.findByUserIdAndBookIdAndStatus(user.getId(), book.getId(), request.status())
                .ifPresent(existing -> {
                    throw new ApiException(HttpStatus.CONFLICT, "Book already exists in this shelf");
                });

        UserBook entry = new UserBook();
        entry.setUser(user);
        entry.setBook(book);
        entry.setStatus(request.status());

        return toDto(userBookRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<LibraryEntryDto> getLibrary(String email, UserBookStatus status) {
        User user = requireUser(email);
        List<UserBook> entries = status == null
                ? userBookRepository.findByUserOrderByCreatedAtDesc(user)
                : userBookRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status);

        return entries.stream().map(this::toDto).toList();
    }

    @Transactional
    public void removeEntry(String email, Long entryId) {
        User user = requireUser(email);
        UserBook entry = userBookRepository.findById(entryId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Library entry not found"));

        if (!entry.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own library items");
        }
        userBookRepository.delete(entry);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private LibraryEntryDto toDto(UserBook entry) {
        Book book = entry.getBook();
        BookDto bookDto = new BookDto(
                book.getId(),
                book.getGoogleBookId(),
                book.getTitle(),
                book.getAuthors(),
                book.getCategory(),
                book.getDescription(),
                book.getThumbnailUrl(),
                book.getPreviewLink(),
                book.getPublishedDate(),
                null,
                null
        );
        return new LibraryEntryDto(entry.getId(), entry.getStatus(), entry.getCreatedAt(), bookDto);
    }
}
