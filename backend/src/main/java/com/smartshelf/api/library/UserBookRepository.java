package com.smartshelf.api.library;

import com.smartshelf.api.auth.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBookRepository extends JpaRepository<UserBook, Long> {

    @EntityGraph(attributePaths = {"book", "user"})
    List<UserBook> findByUserOrderByCreatedAtDesc(User user);

    @EntityGraph(attributePaths = {"book", "user"})
    List<UserBook> findByUserAndStatusOrderByCreatedAtDesc(User user, UserBookStatus status);

    Optional<UserBook> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, UserBookStatus status);
}
