/**
 * croch_etgallery — Admin Centralized Configuration
 */
const AdminConfig = (() => {
  const isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

  return Object.freeze({
    API_BASE: isLocal ? "http://localhost:5000" : "",
    /** Build a full API URL */
    api(path) {
      return this.API_BASE ? `${this.API_BASE}${path}` : path;
    },
    /** Normalize an image filename to a full URL */
    img(filename) {
      if (!filename) return "";
      if (String(filename).startsWith("http")) return filename;
      return `${this.API_BASE}/uploads/${filename}`;
    }
  });
})();
