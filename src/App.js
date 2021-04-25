import React, { useState } from "react";
import "./App.css";
import Layout from "./Components/Layout";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";

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
        <Button onClick={handleThemeChange}>DARK?LIGHT theme</Button>
      </ThemeProvider>
      {/* sidebar */}

      {/* body */}

      {/* footer */}
    </div>
  );
};

export default App;
