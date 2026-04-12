package com.smartshelf.api.library;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @PostMapping
    public LibraryEntryDto addToLibrary(@Valid @RequestBody LibraryRequest request, Authentication authentication) {
        return libraryService.addToLibrary(authentication.getName(), request);
    }

    @GetMapping
    public List<LibraryEntryDto> getLibrary(@RequestParam(required = false) UserBookStatus status, Authentication authentication) {
        return libraryService.getLibrary(authentication.getName(), status);
    }

    @DeleteMapping("/{entryId}")
    public void removeEntry(@PathVariable Long entryId, Authentication authentication) {
        libraryService.removeEntry(authentication.getName(), entryId);
    }
}

