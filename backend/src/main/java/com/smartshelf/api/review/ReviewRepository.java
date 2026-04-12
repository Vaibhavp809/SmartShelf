package com.smartshelf.api.review;

import com.smartshelf.api.book.Book;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);

    Optional<Review> findByUserIdAndBookId(Long userId, Long bookId);

    long countByBookId(Long bookId);

    @Query("select avg(r.rating) from Review r where r.book.id = :bookId")
    Optional<Double> findAverageRatingByBookId(Long bookId);

    @Query("select r.book from Review r group by r.book.id order by avg(r.rating) desc, count(r.id) desc")
    List<Book> findTopRatedBooks(Pageable pageable);
}

