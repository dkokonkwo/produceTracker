const ProduceTracker = artifacts.require("ProduceTracker");

contract("ProduceTracker", (accounts) => {
  let produceTrackerInstance;
  const farmer = accounts[0];
  const endUser = accounts[1];
  const newHolder = accounts[2];
  const unauthorizedUser = accounts[3];

  const produceId = 1001;
  const produceCode = 1011;
  const quantity = 50;
  const qualityRating = 85;

  before(async () => {
    produceTrackerInstance = await ProduceTracker.deployed();
  });

  it("should deploy the contract successfully", async () => {
    assert(
      produceTrackerInstance !== undefined,
      "ProduceTracker contract should be defined"
    );
  });

  it("should register a new produce successfully", async () => {
    const tx = await produceTrackerInstance.registerProduce(
      produceId,
      produceCode,
      quantity,
      endUser,
      qualityRating,
      { from: farmer }
    );

    // Check event emitted
    assert.equal(
      tx.logs[0].event,
      "ProduceRegistered",
      "Event ProduceRegistered not emitted"
    );
    assert.equal(tx.logs[0].args.farmer, farmer, "Incorrect farmer address");

    // Verify produce details
    const produce = await produceTrackerInstance.produces(produceId);
    assert.equal(produce.produceCode, produceCode, "Incorrect produceCode");
    assert.equal(produce.quantity.toNumber(), quantity, "Incorrect quantity");
    assert.equal(produce.farmer, farmer, "Incorrect farmer address");
    assert.equal(produce.endUser, endUser, "Incorrect endUser address");
    assert.equal(produce.currentHolder, farmer, "Incorrect current holder");
    assert.equal(produce.status.toNumber(), 0, "Incorrect initial status"); // 0 = Produced
  });

  it("should fail to register produce with an existing produceId", async () => {
    try {
      await produceTrackerInstance.registerProduce(
        produceId,
        produceCode,
        quantity,
        endUser,
        qualityRating,
        { from: farmer }
      );
      assert.fail("Expected revert not received");
    } catch (error) {
      assert(
        error.message.includes("Already registered"),
        "Expected 'Already registered' error"
      );
    }
  });

  it("should fail to register produce if farmer and endUser are the same", async () => {
    try {
      await produceTrackerInstance.registerProduce(
        1002,
        produceCode,
        quantity,
        farmer,
        qualityRating,
        { from: farmer }
      );
      assert.fail("Expected revert not received");
    } catch (error) {
      assert(
        error.message.includes("Same address as owner"),
        "Expected 'Same address as owner' error"
      );
    }
  });

  it("should update the status of the produce", async () => {
    const tx = await produceTrackerInstance.updateStatus(produceId, 1, {
      from: farmer,
    }); // 1 = InTransit

    // Check event emitted
    assert.equal(
      tx.logs[0].event,
      "StatusUpdated",
      "Event StatusUpdated not emitted"
    );

    // Verify status update
    const produce = await produceTrackerInstance.produces(produceId);
    assert.equal(
      produce.status.toNumber(),
      1,
      "Status was not updated to InTransit"
    );
  });

  it("should fail to update status of unregistered produce", async () => {
    try {
      await produceTrackerInstance.updateStatus(9999, 1, { from: farmer });
      assert.fail("Expected revert not received");
    } catch (error) {
      assert(
        error.message.includes("Produce not registered"),
        `Expected 'Produce not registered' error instead got: ${error.message}`
      );
    }
  });

  it("should fail to update status if sender is not the current holder", async () => {
    try {
      await produceTrackerInstance.updateStatus(produceId, 2, {
        from: unauthorizedUser,
      }); // 2 = Delivered
      assert.fail("Expected revert not received");
    } catch (error) {
      assert(
        error.message.includes("Not authorized"),
        "Expected 'Not authorized' error"
      );
    }
  });

  it("should transfer the holder successfully", async () => {
    const tx = await produceTrackerInstance.transferHolder(
      newHolder,
      produceId,
      {
        from: farmer,
      }
    );

    // Check event emitted
    assert.equal(
      tx.logs[0].event,
      "HolderTransferred",
      "Event HolderTransferred not emitted"
    );

    // Verify new holder
    const produce = await produceTrackerInstance.produces(produceId);
    assert.equal(
      produce.currentHolder,
      newHolder,
      "Current holder not updated"
    );
  });

  it("should fail to transfer holder to address(0)", async () => {
    try {
      await produceTrackerInstance.transferHolder(
        "0x0000000000000000000000000000000000000000",
        produceId,
        { from: newHolder }
      );
      assert.fail("Expected revert not received");
    } catch (error) {
      assert(
        error.message.includes("Invalid address"),
        "Expected 'Invalid address' error"
      );
    }
  });

  it("should fail to transfer holder if sender is not the current holder", async () => {
    try {
      await produceTrackerInstance.transferHolder(accounts[4], produceId, {
        from: unauthorizedUser,
      });
      assert.fail("Expected revert not received");
    } catch (error) {
      assert(
        error.message.includes("Not authorized"),
        "Expected 'Not authorized' error"
      );
    }
  });
});