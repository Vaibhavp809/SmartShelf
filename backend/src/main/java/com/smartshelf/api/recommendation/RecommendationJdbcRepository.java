package com.smartshelf.api.recommendation;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RecommendationJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public RecommendationJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<RecommendationDto> findGenreBasedRecommendations(String category, Long userId) {
        String sql = """
                select b.id, b.google_book_id, b.title, b.authors, b.category, b.thumbnail_url,
                       coalesce(avg(r.rating), 0) as score
                from books b
                left join reviews r on r.book_id = b.id
                where lower(b.category) like concat('%', lower(?), '%')
                  and b.id not in (
                      select ub.book_id from user_books ub where ub.user_id = ?
                  )
                group by b.id, b.google_book_id, b.title, b.authors, b.category, b.thumbnail_url
                order by score desc, b.created_at desc
                limit 12
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new RecommendationDto(
                rs.getLong("id"),
                rs.getString("google_book_id"),
                rs.getString("title"),
                rs.getString("authors"),
                rs.getString("category"),
                rs.getString("thumbnail_url"),
                rs.getDouble("score"),
                "Because you enjoy " + rs.getString("category")
        ), category, userId);
    }

    public List<RecommendationDto> findUsersAlsoLiked(Long bookId) {
        String sql = """
                select b2.id, b2.google_book_id, b2.title, b2.authors, b2.category, b2.thumbnail_url,
                       count(*) as score
                from reviews r1
                join reviews r2 on r1.user_id = r2.user_id and r2.book_id <> r1.book_id
                join books b2 on b2.id = r2.book_id
                where r1.book_id = ?
                  and r1.rating >= 4
                  and r2.rating >= 4
                group by b2.id, b2.google_book_id, b2.title, b2.authors, b2.category, b2.thumbnail_url
                order by score desc
                limit 10
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new RecommendationDto(
                rs.getLong("id"),
                rs.getString("google_book_id"),
                rs.getString("title"),
                rs.getString("authors"),
                rs.getString("category"),
                rs.getString("thumbnail_url"),
                rs.getDouble("score"),
                "Readers who loved this book also liked it"
        ), bookId);
    }

    public List<AnalyticsDto> findTopRatedBooksPerCategory() {
        String sql = """
                select b.id, b.google_book_id, b.title, b.category, b.thumbnail_url,
                       round(avg(r.rating), 2) as average_rating, count(r.id) as review_count
                from books b
                join reviews r on r.book_id = b.id
                group by b.id, b.google_book_id, b.title, b.category, b.thumbnail_url
                having count(r.id) >= 1
                order by b.category asc, average_rating desc, review_count desc
                limit 20
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new AnalyticsDto(
                rs.getLong("id"),
                rs.getString("google_book_id"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getString("thumbnail_url"),
                rs.getDouble("average_rating"),
                rs.getLong("review_count")
        ));
    }

    public List<AnalyticsDto> findPopularBooks() {
        String sql = """
                select b.id, b.google_book_id, b.title, b.category, b.thumbnail_url,
                       round(avg(coalesce(r.rating, 0)), 2) as average_rating,
                       count(distinct ub.id) + count(distinct r.id) as review_count
                from books b
                left join reviews r on r.book_id = b.id
                left join user_books ub on ub.book_id = b.id
                group by b.id, b.google_book_id, b.title, b.category, b.thumbnail_url
                order by review_count desc, average_rating desc
                limit 12
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new AnalyticsDto(
                rs.getLong("id"),
                rs.getString("google_book_id"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getString("thumbnail_url"),
                rs.getDouble("average_rating"),
                rs.getLong("review_count")
        ));
    }
}
