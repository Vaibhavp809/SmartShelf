package com.smartshelf.api.review;

import com.smartshelf.api.auth.User;
import com.smartshelf.api.auth.UserRepository;
import com.smartshelf.api.book.Book;
import com.smartshelf.api.book.BookService;
import com.smartshelf.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, BookService bookService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.bookService = bookService;
    }

    public ReviewDto saveReview(String email, ReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Book book = bookService.requireBook(request.bookId());

        Review review = reviewRepository.findByUserIdAndBookId(user.getId(), book.getId())
                .orElseGet(Review::new);
        review.setUser(user);
        review.setBook(book);
        review.setRating(request.rating());
        review.setComment(request.comment());
        return toDto(reviewRepository.save(review));
    }

    public List<ReviewDto> getReviewsByBook(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream().map(this::toDto).toList();
    }

    private ReviewDto toDto(Review review) {
        return new ReviewDto(
                review.getId(),
                review.getBook().getId(),
                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}

