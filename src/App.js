import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Layout from "./components/Layout";
import Skills from "./components/Skills";
import Soundbar from "./components/Soundbar";
import Terminal from "./components/Terminal";
import "./App.scss";

function App() {
  return (
    <>
      <Terminal />
      <Soundbar />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/skills" element={<Skills />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
