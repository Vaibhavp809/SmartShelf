import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartshelf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function fetchTrending() {
  const { data } = await api.get("/books/trending");
  return data;
}

export async function searchBooks(query, page = 0, size = 12) {
  const { data } = await api.get("/books/search", { params: { query, page, size } });
  return data;
}

export async function fetchBookDetails(googleBookId) {
  const { data } = await api.get(`/books/details/${googleBookId}`);
  return data;
}

export async function importBook(googleBookId) {
  const { data } = await api.post("/books/import", { googleBookId });
  return data;
}

export async function addToLibrary(payload) {
  const { data } = await api.post("/library", payload);
  return data;
}

export async function fetchLibrary(status) {
  const { data } = await api.get("/library", { params: status ? { status } : {} });
  return data;
}

export async function removeLibraryEntry(entryId) {
  await api.delete(`/library/${entryId}`);
}

export async function fetchReviews(bookId) {
  const { data } = await api.get(`/reviews/book/${bookId}`);
  return data;
}

export async function submitReview(payload) {
  const { data } = await api.post("/reviews", payload);
  return data;
}

export async function fetchGenreRecommendations(category) {
  const { data } = await api.get("/recommendations/genre", { params: { category } });
  return data;
}

export async function fetchAlsoLiked(bookId) {
  const { data } = await api.get(`/recommendations/also-liked/${bookId}`);
  return data;
}

export async function fetchPopularBooks() {
  const { data } = await api.get("/recommendations/popular");
  return data;
}

export async function fetchTopRatedBooks() {
  const { data } = await api.get("/recommendations/top-rated");
  return data;
}

export default api;

