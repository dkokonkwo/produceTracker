import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, Button, Modal } from "react-bootstrap";
import { allProduce } from "./AllProduce";
import { getNumber } from "ethers";
import "../App.css";
import ProduceTracker from "../artifacts/contracts/ProduceTracker.sol/ProduceTracker.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function Produce() {
  const [recipient, setRecipient] = useState("");
  const [balance, setBalance] = useState(null);
  const [action, setAction] = useState(null);

  useEffect(() => {
    getNumOfProduce();
    console.log(balance);
  }, []);

  const getNumOfProduce = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      ProduceTracker.abi,
      signer
    );
    try {
      const numProd = await contract.numberOfProduces();
      console.log("number of produce:", Number(numProd));
      setBalance(Number(numProd));
    } catch (error) {
      if (error.message.includes("Invalid quality rating")) {
        setAction("Invalid quality rating");
      }
      setAction("Something went wrong");
      console.error("Error:", error);
    }
  };

  return (
    <div className="master-container">
      {balance > 0 ? (
        Array(balance)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="produce-container">
              <ProduceCard produceIndex={i} />
            </div>
          ))
      ) : (
        <h5>No farm produce to track</h5>
      )}
    </div>
  );
}

export default Produce;

function ProduceCard({ produceIndex }) {
  const [showModal, setShowModal] = useState(false);
  const [produce, setProduce] = useState({});
  const [produceId, setProduceId] = useState(0);
  const [matched, setMatched] = useState({});

  useEffect(() => {
    getProduce();
  }, []);

  const getProduce = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      ProduceTracker.abi,
      signer
    );
    try {
      const produceID = await contract.produceIds(produceIndex);
      console.log("ID of produce:", Number(produceID));
      setProduceId(Number(produceID));
      const raw = await contract.produces(Number(produceID));
      console.log("Produce: ", raw);
      const newProduce = {
        produceCode: Number(raw[0]),
        quantity: Number(raw[1]),
        timestamp: Number(raw[2]),
        farmer: raw[3],
        endUser: raw[4],
        currentHolder: Number(raw[5]),
        status: Number(raw[6]),
        qualityRating: Number(raw[7]),
      };
      setProduce(newProduce);
      const match = allProduce.find((p) => p.id === newProduce.produceCode);
      console.log("match: ", match);
      setMatched(match);
    } catch (error) {
      console.log("Something went wrong");
      console.error("Produce Error:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }} className="card-modal">
      <Card
        className="prod"
        style={{
          width: "250px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          padding: "15px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "4rem",
            marginBottom: "10px",
          }}
        >
          {matched.icon}
        </div>
        <Card.Body style={{ textAlign: "left" }}>
          <Card.Title style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {matched.label}
          </Card.Title>
          <Card.Text style={{ fontSize: "0.9rem", color: "#555" }}>
            <strong>Produce ID:</strong> {produceId}
            <br />
            <strong>Code:</strong> {produce.produceCode}
            <br />
            <strong>Quantity:</strong> {produce.quantity} units
            <br />
            <strong>Quality Rating:</strong> {produce.qualityRating} ★
          </Card.Text>
          <Button
            variant="info"
            style={{ width: "100%" }}
            onClick={() => setShowModal(true)}
          >
            View Tracking
          </Button>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thank You</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Thank you for supporting sustainable agriculture!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
