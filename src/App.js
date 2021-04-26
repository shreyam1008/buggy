import React, { useState } from "react";
import "./App.css";
import Layout from "./Components/Layout";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { Route, Routes } from "react-router-dom";
import Resume from "./Components/Resume";
import Contact from "./Components/Contact";
import Portfolio from "./Components/Portfolio";
import Tlog from "./Components/Tlog";

const App = () => {
  const [darkState, setDarkState] = useState(false);
  const palletType = darkState ? "dark" : "light";
  const darkTheme = createMuiTheme({
    palette: {
      type: palletType,
    },
  });
  const handleThemeChange = () => {
    setDarkState(!darkState);
  };
  return (
    <div className="app">
      <ThemeProvider theme={darkTheme}>
        <Layout />
        <Button onClick={handleThemeChange}>DARK?LIGHT theme</Button>
        {/* shift the button into the drawer cmoponent to above cmponent */}
      </ThemeProvider>
    </div>
  );
};

export default App;
