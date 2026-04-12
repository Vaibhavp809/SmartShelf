package com.smartshelf.api.book;

import com.smartshelf.api.common.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class GoogleBooksClient {

    private final RestClient restClient;
    private final String apiKey;

    public GoogleBooksClient(@Value("${app.google-books.base-url}") String baseUrl,
                             @Value("${app.google-books.api-key}") String apiKey) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public GoogleBooksResponse search(String query, int startIndex, int maxResults) {
        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/volumes")
                            .queryParam("q", query)
                            .queryParam("startIndex", startIndex)
                            .queryParam("maxResults", maxResults)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(GoogleBooksResponse.class);
        } catch (RestClientException exception) {
            return new GoogleBooksResponse(List.of());
        }
    }

    public GoogleBooksResponse.GoogleBookItem getByGoogleId(String googleBookId) {
        GoogleBooksResponse.GoogleBookItem item;
        try {
            item = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/volumes/{id}")
                            .queryParam("key", apiKey)
                            .build(googleBookId))
                    .retrieve()
                    .body(GoogleBooksResponse.GoogleBookItem.class);
        } catch (RestClientException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Google Books is unavailable right now");
        }

        if (item == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Book not found in Google Books");
        }
        return item;
    }
}
