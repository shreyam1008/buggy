import React from "react";
import { Route, Routes } from "react-router";
import Contact from "./Components/Contact";
import Home from "./Components/Home";
import Portfolio from "./Components/Portfolio";
import Resume from "./Components/Resume";
import Tlog from "./Components/Tlog";

const Routing = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tlog" element={<Tlog />} />
      </Routes>
    </>
  );
};

export default Routing;
