package com.smartshelf.api.library;

import com.smartshelf.api.auth.User;
import com.smartshelf.api.book.Book;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "user_books", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_book_status", columnNames = {"user_id", "book_id", "status"})
})
public class UserBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id")
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserBookStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public UserBookStatus getStatus() {
        return status;
    }

    public void setStatus(UserBookStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

