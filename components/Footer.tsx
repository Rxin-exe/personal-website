import { profile, site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © 2026 {profile.name} · Updated {site.updated}
        </span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
