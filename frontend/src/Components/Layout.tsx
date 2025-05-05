import React from "react";
import Header from "./Header";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <>
      <Header setIsModalOpen={() => {}} isModalOpen={false} />
      <Outlet />
    </>
  );
};

export default Layout;
