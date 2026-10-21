import { profile } from "@/content/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© 2026 {profile.name}</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
