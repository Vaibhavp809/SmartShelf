package com.smartshelf.api.recommendation;

import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/genre")
    public List<RecommendationDto> getGenreBasedRecommendations(@RequestParam @NotBlank String category,
                                                                Authentication authentication) {
        return recommendationService.getGenreBasedRecommendations(authentication.getName(), category);
    }

    @GetMapping("/also-liked/{bookId}")
    public List<RecommendationDto> getUsersAlsoLiked(@PathVariable Long bookId) {
        return recommendationService.getUsersAlsoLiked(bookId);
    }

    @GetMapping("/top-rated")
    public List<AnalyticsDto> getTopRatedPerCategory() {
        return recommendationService.getTopRatedPerCategory();
    }

    @GetMapping("/popular")
    public List<AnalyticsDto> getPopularBooks() {
        return recommendationService.getPopularBooks();
    }
}
