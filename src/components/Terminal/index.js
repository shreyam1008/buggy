import React, { useState } from "react";
import styled from "styled-components";

const Box = styled.div`
  display: flex;
  cursor: pointer;
  position: fixed;
  left: 40vw;
  top: 3rem;
  z-index: 3;

  &:before {
    content: "<terminal>";
    font-family: "La Belle Aurore", cursive;
    color: #00ff7f;
    font-size: 18px;
    position: absolute;
    margin-top: -20px;
    left: -60px;
    opacity: 0.9;
    line-height: 20 px;
  }
`;

const Terminal = () => {
  const [click, setClick] = useState(false);

  const handleClick = () => {
    setClick(!click);
  };
  return (
    <Box onClick={() => handleClick()}>
      <h2>iTerm-image</h2>
    </Box>
  );
};

export default Terminal;
