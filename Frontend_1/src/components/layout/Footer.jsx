function Footer() {
  return (
    <footer
      style={{
        padding: "16px 32px",
        borderTop: "1px solid var(--border-color)",
        textAlign: "center",
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        backgroundColor: "light-dark(#ffffff, #0d111a)",
        transition: "background-color var(--transition-normal)",
      }}
    >
      <p>SelfStack &copy; 2026. Made with Google Antigravity pair programming support.</p>
    </footer>
  );
}

export default Footer;
