import React, { useState, useEffect } from "react";
import { allProduce } from "./AllProduce";
import { ethers } from "ethers";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
  Modal,
} from "react-bootstrap";
import ProduceTracker from "../artifacts/contracts/ProduceTracker.sol/ProduceTracker.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const FarmerProduceForm = () => {
  const [contract, setContract] = useState(null);
  const [action, setAction] = useState(null);
  const [formData, setFormData] = useState({
    produceId: 0,
    produceCode: 0,
    quantity: 0,
    endUser: "",
    qualityRating: "",
  });
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const registerProduce = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      ProduceTracker.abi,
      signer
    );
    try {
      const result = await contract.registerProduce(
        formData.produceId,
        formData.produceCode,
        formData.quantity,
        formData.endUser,
        formData.qualityRating
      );
      console.log(
        "Registering new produce for tracking. Waiting for confirmation..."
      );
      await result.wait();
      setAction("Done");
      console.log("Done. Produce Registered");
    } catch (error) {
      if (error.message.includes("Invalid quality rating")) {
        setAction("Invalid quality rating");
        }
        setAction("Something went wrong");
      console.error("Error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      setSubmitted(true);
      await registerProduce();
    }
    setValidated(true);
  };

  return (
    <Container
      className="mt-5 p-4 prod"
      style={{
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="text-center text-info">🌾 Farmer Produce Entry</h2>
      {submitted && (
        <Alert variant="success">Form submitted successfully!</Alert>
      )}

      <div className="d-flex flex-wrap justify-content-center mb-4">
        {allProduce.map((produce) => (
          <Card
            key={produce.id}
            className="m-2 text-center p-2"
            style={{
              width: "8rem",
              backgroundColor: "#d1ecf1",
              border: "1px solid #bee5eb",
            }}
          >
            <Card.Body>
              <Card.Title>{produce.icon}</Card.Title>
              <Card.Text>{produce.label}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group controlId="produceId">
              <Form.Label>Produce ID</Form.Label>
              <Form.Control
                type="text"
                name="produceId"
                value={formData.produceId}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Produce ID is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="produceCode">
              <Form.Label>Produce Code</Form.Label>
              <Form.Control
                as="select"
                name="produceCode"
                value={formData.produceCode}
                onChange={handleChange}
                required
              >
                <option value="">Select Produce</option>
                {allProduce.map((produce) => (
                  <option key={produce.id} value={produce.id}>
                    {produce.icon} {produce.label}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Please select a produce code.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <Form.Group controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Quantity is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="endUser">
              <Form.Label>End User Address</Form.Label>
              <Form.Control
                type="text"
                name="endUser"
                value={formData.endUser}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                End User is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <Form.Group controlId="qualityRating">
              <Form.Label>Quality Rating</Form.Label>
              <Form.Control
                as="select"
                name="qualityRating"
                value={formData.qualityRating}
                onChange={handleChange}
                required
              >
                <option value="">Select Rating</option>
                <option value="20">1 - Poor</option>
                <option value="40">2 - Fair</option>
                <option value="60">3 - Good</option>
                <option value="80">4 - Very Good</option>
                <option value="100">5 - Excellent</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Please select a quality rating.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" className="mt-4" variant="info">
          Submit
        </Button>
      </Form>
      <ActionCompleted action={action} />
    </Container>
  );
};

export default FarmerProduceForm;

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
