package com.smartshelf.api.book;

import java.util.List;

public record GoogleBooksResponse(List<GoogleBookItem> items) {

    public record GoogleBookItem(String id, VolumeInfo volumeInfo) {
    }

    public record VolumeInfo(
            String title,
            List<String> authors,
            List<String> categories,
            String description,
            ImageLinks imageLinks,
            String previewLink,
            String publishedDate
    ) {
    }

    public record ImageLinks(String thumbnail, String smallThumbnail) {
    }
}

