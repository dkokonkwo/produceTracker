import React, { useState, useEffect } from "react";
import "../App.css";
import { BoxTick, TruckFast, NoteText } from "iconsax-react";
import { Button, Form, Modal } from "react-bootstrap";
import { ethers } from "ethers";
import ProduceTracker from "../artifacts/contracts/ProduceTracker.sol/ProduceTracker.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function TrackingDetails({ produce, produceId }) {
  const [action, setAction] = useState(null);
  const [validated, setValidated] = useState(false);
  const statusMapping = {
    0: "Ordered",
    1: "In Transit",
    2: "Delivered",
  };
  const [status, setStatus] = useState(
    statusMapping[produce.status] || "Update Status"
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStatus(value);
  };

  const updateStatus = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      ProduceTracker.abi,
      signer
    );
    try {
      const result = await contract.updateStatus(produceId, status);
      console.log("Update status...");
      await result.wait();
      console.log("Done. message:", result);
      window.location.reload();
    } catch (error) {
      if (error.message.includes("Not authorized")) {
        setAction("Not authorized");
      } else {
        console.log("Something went wrong");
      }
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      updateStatus();
    }
    setValidated(true);
  };

  return (
    <div className="tracking-details">
      <div className="tracking-info">
        <strong>Farmer:</strong> {produce.farmer}
        <br />
        <strong>Current Handler:</strong> {produce.currentHolder}
        <br />
        <strong>Timestamp:</strong> {produce.timestamp}
      </div>
      <div className="tracking-chart">
        <div className="ordered">
          <div className="circle">
            <NoteText size="32" color="#0dcaf0" variant="Bold" />
          </div>
          <h5>Ordered</h5>
        </div>
        <div className={produce.status == 1 ? "line done" : "line not"}></div>
        <div className="ordered">
          <div className="circle">
            <TruckFast
              size="32"
              color={produce.status == 1 ? "#0dcaf0" : "#555555"}
              variant="Bold"
            />
          </div>
          <h5>In Transit</h5>
        </div>
        <div className={produce.status == 2 ? "line done" : "line not"}></div>
        <div className="ordered">
          <div className="circle">
            <BoxTick
              size="32"
              color={produce.status == 2 ? "#0dcaf0" : "#555555"}
              variant="Bold"
            />
          </div>
          <h5>Delivered</h5>
        </div>
      </div>
      <Form
        className="status-update"
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
        <Form.Group controlId="qualityRating">
          <Form.Control
            className="update-control"
            as="select"
            name="qualityRating"
            value={status}
            onChange={handleChange}
            required
          >
            <option value="">{status}</option>
            <option value="1">In Transit</option>
            <option value="2">Delivered</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Update status
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" variant="info">
          Update Status
        </Button>
      </Form>
      <ActionCompleted action={action} />
    </div>
  );
}

export default TrackingDetails;

const ActionCompleted = ({ action }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (action) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);

      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [action]); // Runs only when `action` changes

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Body>{action}</Modal.Body>
    </Modal>
  );
};
