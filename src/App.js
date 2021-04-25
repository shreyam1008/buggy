import React, { useState } from "react";
import "./App.css";
import Layout from "./Components/Layout";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { Route, Switch } from "react-router";
import Resume from "./Components/Resume";
import Contact from "./Components/Contact";
import Portfolio from "./Components/Portfolio";

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
        {/* shift the button into the drawer cmoponent to above cmponent */}
        <Switch>
          <Route exact path="/home" component={Layout} />
          <Route exact path="/resume" component={Resume} />
          <Route exact path="/portfolio" component={Portfolio} />
          <Route exact path="/contact" component={Contact} />
        </Switch>
        <Button onClick={handleThemeChange}>DARK?LIGHT theme</Button>
      </ThemeProvider>
    </div>
  );
};

export default App;
