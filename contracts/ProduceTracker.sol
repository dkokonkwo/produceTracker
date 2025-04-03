// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract ProduceTracker {
    enum Status { Produced, InTransit, Delivered }

    struct Produce {
        uint256 produceCode;     // Code for type of produce (e.g., 1011 for bananas, 4012 for apples)
        uint256 quantity;        // Quantity (e.g., kilograms)
        uint256 timestamp;       // Time of registration
        address farmer;          // Farmer's address
        address endUser;         // End node's address (e.g., wholesaler, consumer)
        address currentHolder;   // Current holder's address
        Status status;           // Current status
        uint8 qualityRating;     // Quality rating (0-100)
    }

    mapping(uint256 => Produce) public produces;
    uint256[] public produceIds; // tracking of registered produce IDs
    uint256 public numberOfProduces;

    event ProduceRegistered(uint256 indexed produceId, address indexed farmer, uint256 quantity, uint256 timestamp);
    event StatusUpdated(uint256 indexed produceId, Status newStatus, uint256 timestamp);
    event HolderTransferred(uint256 indexed produceId, address from, address to);

    modifier verifyProduceDetails(uint256 _produceId, address _endUser) {
        require(produces[_produceId].timestamp == 0, "Already registered");
        require(msg.sender != _endUser, "Same address as owner");
        _;
    }

    modifier onlyCurrentHolder(uint256 _produceId) {
        require(produces[_produceId].timestamp != 0, "Produce not registered");
        require(produces[_produceId].currentHolder == msg.sender, "Not authorized");
        _;
    }

    function registerProduce(
        uint256 _produceId,
        uint256 _produceCode,
        uint256 _quantity,
        address _endUser,
        uint8 _qualityRating
    ) external verifyProduceDetails(_produceId, _endUser) {
        require(_qualityRating <= 100, "Invalid quality rating");

        produces[_produceId] = Produce({
            produceCode: _produceCode,
            quantity: _quantity,
            timestamp: block.timestamp,
            farmer: msg.sender,
            endUser: _endUser,
            currentHolder: msg.sender,
            status: Status.Produced,
            qualityRating: _qualityRating
        });

        produceIds.push(_produceId);
        numberOfProduces++;

        emit ProduceRegistered(_produceId, msg.sender, _quantity, block.timestamp);
    }

    function updateStatus(uint256 _produceId, Status _newStatus) external onlyCurrentHolder(_produceId) {
        require(produces[_produceId].timestamp != 0, "Produce not registered");

        produces[_produceId].status = _newStatus;
        emit StatusUpdated(_produceId, _newStatus, block.timestamp);
    }

    function transferHolder(address to, uint256 _produceId) public onlyCurrentHolder(_produceId) {
        require(to != address(0), "Invalid address");

        produces[_produceId].currentHolder = to;
        emit HolderTransferred(_produceId, msg.sender, to);
    }
}
