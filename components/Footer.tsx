import { profile, site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="container footer">
      <span>
        © 2026 {profile.name}. Updated {site.updated}.
      </span>
      <span className="footer-hint">
        Press <kbd>/</kbd> to jump anywhere
      </span>
    </footer>
  );
}
