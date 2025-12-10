import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProductListPage from "./pages/ProductListPage";
import PurchaseFormPage from "./pages/PurchaseFormPage";
import PurchaseListPage from "./pages/PurchaseListPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<ProductListPage />}
          />
          <Route
            path="/purchases"
            element={<PurchaseListPage />}
          />
          <Route
            path="/purchases/new"
            element={<PurchaseFormPage />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
