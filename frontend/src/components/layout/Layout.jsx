import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Navbar />

        <main
          style={{
            flex: 1,
            padding: "25px",
            background: "#f4f6f9",
          }}
        >
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default Layout;