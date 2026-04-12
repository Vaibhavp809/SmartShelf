package com.smartshelf.api.book;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/search")
    public List<BookDto> searchBooks(@RequestParam @NotBlank String query,
                                     @RequestParam(defaultValue = "0") @Min(0) int page,
                                     @RequestParam(defaultValue = "12") @Min(1) @Max(20) int size) {
        return bookService.searchBooks(query, page, size);
    }

    @GetMapping("/details/{googleBookId}")
    public BookDto getBookDetails(@PathVariable String googleBookId) {
        return bookService.getBookByGoogleId(googleBookId);
    }

    @GetMapping("/trending")
    public List<BookDto> trendingBooks() {
        return bookService.trendingBooks();
    }

    @PostMapping("/import")
    public BookDto importBook(@Valid @RequestBody BookImportRequest request) {
        return bookService.importBook(request.googleBookId());
    }
}
