const noop = (e) => e.preventDefault();

// Footer links are visual only in this prototype.
export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="site-footer__links" aria-label="Footer">
        <a href="#" onClick={noop} className="site-footer__link">Blog</a>
        <a href="#" onClick={noop} className="site-footer__link">About Sciety</a>
        <a href="#" onClick={noop} className="site-footer__link">Contact</a>
      </nav>
      <p className="site-footer__legal">
        © eLife Sciences Publications Ltd. <a href="#" onClick={noop}>Legal information</a>
      </p>
    </footer>
  );
}
