import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import styled from "@emotion/styled";

const Layout: React.FC = () => {
  return (
    <div>
      <FooterSpacer>
        <Header></Header>
        <Outlet />
      </FooterSpacer>
    </div>
  );
};

const FooterSpacer = styled.div`
  min-height: 100vh;
`;

export default Layout;
