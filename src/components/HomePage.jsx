import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import "../App.css";
import Produce from "./Produce";
import FarmerProduceForm from "./RegisterProduce";

function HomePage() {
  return (
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3"
      fill
    >
      <Tab eventKey="home" title="All Produce" className="tabby">
        <Produce />
      </Tab>
      <Tab eventKey="profile" title="Register New Produce" className="tabby">
        <FarmerProduceForm />
      </Tab>
    </Tabs>
  );
}

export default HomePage;
