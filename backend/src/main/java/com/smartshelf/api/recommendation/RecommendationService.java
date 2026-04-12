package com.smartshelf.api.recommendation;

import com.smartshelf.api.auth.User;
import com.smartshelf.api.auth.UserRepository;
import com.smartshelf.api.book.Book;
import com.smartshelf.api.book.BookService;
import com.smartshelf.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    private final RecommendationJdbcRepository recommendationJdbcRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    public RecommendationService(RecommendationJdbcRepository recommendationJdbcRepository,
                                 UserRepository userRepository,
                                 BookService bookService) {
        this.recommendationJdbcRepository = recommendationJdbcRepository;
        this.userRepository = userRepository;
        this.bookService = bookService;
    }

    public List<RecommendationDto> getGenreBasedRecommendations(String email, String category) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        List<RecommendationDto> recommendations =
                recommendationJdbcRepository.findGenreBasedRecommendations(normalizeCategory(category), user.getId());

        if (!recommendations.isEmpty()) {
            return recommendations;
        }

        return recommendationJdbcRepository.findGenreBasedRecommendations(category, user.getId());
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return category;
        }

        return category.split("[,/&]")[0].trim();
    }

    public List<RecommendationDto> getUsersAlsoLiked(Long bookId) {
        Book book = bookService.requireBook(bookId);
        return recommendationJdbcRepository.findUsersAlsoLiked(book.getId());
    }

    public List<AnalyticsDto> getTopRatedPerCategory() {
        return recommendationJdbcRepository.findTopRatedBooksPerCategory();
    }

    public List<AnalyticsDto> getPopularBooks() {
        return recommendationJdbcRepository.findPopularBooks();
    }
}
