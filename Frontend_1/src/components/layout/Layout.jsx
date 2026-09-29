import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="app-wrapper">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
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
