import { Avatar, Box, Typography } from "@material-ui/core";
import React from "react";
import { data } from "../data";

const Home = () => {
  return (
    <div>
      <Box color="text.secondary">
        <Avatar src={data.personalPhoto} alt="Shreyam Adhikari" />
        <Typography variant="h3">Shreyam Adhiakri</Typography>
      </Box>
    </div>
  );
};

export default Home;
