import { Routes, Route, BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Pdf from "./pages/Pdf";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sample from "./pages/Sample";
import Layout from "./Components/Layout";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pdf/:id" element={<Pdf />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sample" element={<Sample />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
