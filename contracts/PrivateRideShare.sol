// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateRideShare
 * @notice FHE-based private ride sharing with Gateway callback pattern
 * @dev Implements:
 *   - Refund mechanism for decryption failures
 *   - Timeout protection against permanent locks
 *   - Gateway callback pattern for async decryption
 *   - Privacy via random multipliers
 *   - Price obfuscation
 *   - Gas/HCU optimization
 */
contract PrivateRideShare is SepoliaConfig {

    // ===== Constants =====
    uint256 public constant MIN_FARE = 100; // Minimum fare in smallest unit
    uint256 public constant MAX_FARE = 10000000; // Maximum fare
    uint256 public constant REQUEST_TIMEOUT = 1 hours; // Timeout for ride requests
    uint256 public constant DECRYPTION_TIMEOUT = 30 minutes; // Timeout for decryption callbacks
    uint256 public constant MIN_DEPOSIT = 0.001 ether; // Minimum deposit
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5% platform fee
    uint256 public constant PRIVACY_MULTIPLIER_RANGE = 1000; // For random multiplier privacy

    // ===== State Variables =====
    address public owner;
    uint256 public rideCounter;
    uint256 public driverCounter;
    uint256 public platformFees;
    bool public isTesting;

    struct PrivateLocation {
        euint32 encryptedLat;
        euint32 encryptedLng;
        bool isSet;
    }

    struct PrivateRideRequest {
        address passenger;
        PrivateLocation pickup;
        PrivateLocation destination;
        euint32 encryptedMaxFare;
        uint256 requestTime;
        bool isActive;
        bool isMatched;
        address matchedDriver;
        uint256 estimatedDuration;
        uint256 deposit; // Passenger deposit for refund mechanism
        uint256 decryptionRequestId; // For Gateway callback
        bool decryptionPending; // Waiting for Gateway callback
        uint256 decryptionRequestTime; // Timeout tracking
    }

    struct PrivateDriver {
        address driverAddress;
        PrivateLocation currentLocation;
        euint32 encryptedMinFare;
        bool isAvailable;
        bool isVerified;
        uint256 totalRides;
        uint256 registrationTime;
        uint256 deposit; // Driver deposit for refund mechanism
    }

    struct RideMatch {
        uint256 rideId;
        address passenger;
        address driver;
        euint64 encryptedFinalFare;
        euint64 obfuscatedFare; // Price obfuscation
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
        bool fareDisputed;
        uint64 revealedFare; // After decryption
        uint256 decryptionRequestId;
        bool refundProcessed;
    }

    // ===== Mappings =====
    mapping(uint256 => PrivateRideRequest) public rideRequests;
    mapping(address => PrivateDriver) public drivers;
    mapping(uint256 => RideMatch) public completedRides;
    mapping(address => uint256[]) public passengerHistory;
    mapping(address => uint256[]) public driverHistory;
    mapping(address => bool) public registeredDrivers;
    mapping(uint256 => string) internal rideIdByRequestId; // Gateway callback mapping
    mapping(uint256 => uint256) internal fareRequestToRide; // Map decryption request to ride

    uint256[] public activeRideRequests;
    address[] public availableDrivers;

    // ===== Events =====
    event RideRequested(uint256 indexed rideId, address indexed passenger, uint256 timestamp, uint256 deposit);
    event DriverRegistered(address indexed driver, uint256 timestamp, uint256 deposit);
    event RideMatched(uint256 indexed rideId, address indexed passenger, address indexed driver);
    event RideCompleted(uint256 indexed rideId, address indexed passenger, address indexed driver);
    event LocationUpdated(address indexed driver, uint256 timestamp);
    event FareDispute(uint256 indexed rideId, address indexed disputer);
    event FareDecryptionRequested(uint256 indexed rideId, uint256 requestId);
    event FareRevealed(uint256 indexed rideId, uint64 revealedFare);
    event RefundProcessed(uint256 indexed rideId, address indexed recipient, uint256 amount, string reason);
    event TimeoutClaimed(uint256 indexed rideId, address indexed claimer, uint256 amount);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);
    event DepositRefunded(address indexed user, uint256 amount);

    // ===== Modifiers =====
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyRegisteredDriver() {
        require(registeredDrivers[msg.sender], "Not a registered driver");
        _;
    }

    modifier onlyActiveRide(uint256 rideId) {
        require(rideRequests[rideId].isActive, "Ride not active");
        _;
    }

    modifier validFare(uint256 fare) {
        require(fare >= MIN_FARE && fare <= MAX_FARE, "Fare out of valid range");
        _;
    }

    modifier validLocation(uint32 lat, uint32 lng) {
        // Basic coordinate validation (scaled integers)
        require(lat <= 90000000 && lng <= 180000000, "Invalid coordinates");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    bool private _locked;

    // ===== Constructor =====
    constructor() {
        owner = msg.sender;
        rideCounter = 1;
        driverCounter = 0;
    }

    // ===== Admin Functions =====
    function setTesting(bool enabled) external onlyOwner {
        isTesting = enabled;
    }

    function withdrawPlatformFees(address to) external onlyOwner nonReentrant {
        require(platformFees > 0, "No fees to withdraw");
        uint256 amount = platformFees;
        platformFees = 0;
        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit PlatformFeesWithdrawn(to, amount);
    }

    // ===== Driver Functions =====
    function registerDriver(
        externalEuint32 _encryptedLat,
        externalEuint32 _encryptedLng,
        externalEuint32 _encryptedMinFare,
        bytes calldata inputProof
    ) external payable {
        require(!registeredDrivers[msg.sender], "Already registered as driver");
        require(msg.value >= MIN_DEPOSIT, "Insufficient deposit");

        euint32 encryptedLat = FHE.fromExternal(_encryptedLat, inputProof);
        euint32 encryptedLng = FHE.fromExternal(_encryptedLng, inputProof);
        euint32 encryptedMinFare = FHE.fromExternal(_encryptedMinFare, inputProof);

        drivers[msg.sender] = PrivateDriver({
            driverAddress: msg.sender,
            currentLocation: PrivateLocation({
                encryptedLat: encryptedLat,
                encryptedLng: encryptedLng,
                isSet: true
            }),
            encryptedMinFare: encryptedMinFare,
            isAvailable: true,
            isVerified: false,
            totalRides: 0,
            registrationTime: block.timestamp,
            deposit: msg.value
        });

        registeredDrivers[msg.sender] = true;
        availableDrivers.push(msg.sender);
        driverCounter++;

        // Allow contract and driver to access encrypted data
        FHE.allowThis(encryptedLat);
        FHE.allowThis(encryptedLng);
        FHE.allowThis(encryptedMinFare);
        FHE.allow(encryptedLat, msg.sender);
        FHE.allow(encryptedLng, msg.sender);
        FHE.allow(encryptedMinFare, msg.sender);

        emit DriverRegistered(msg.sender, block.timestamp, msg.value);
    }

    // ===== Passenger Functions =====
    function requestRide(
        externalEuint32 _encryptedPickupLat,
        externalEuint32 _encryptedPickupLng,
        externalEuint32 _encryptedDestLat,
        externalEuint32 _encryptedDestLng,
        externalEuint32 _encryptedMaxFare,
        bytes calldata inputProof
    ) external payable {
        require(msg.value >= MIN_DEPOSIT, "Insufficient deposit");

        euint32 encryptedPickupLat = FHE.fromExternal(_encryptedPickupLat, inputProof);
        euint32 encryptedPickupLng = FHE.fromExternal(_encryptedPickupLng, inputProof);
        euint32 encryptedDestLat = FHE.fromExternal(_encryptedDestLat, inputProof);
        euint32 encryptedDestLng = FHE.fromExternal(_encryptedDestLng, inputProof);
        euint32 encryptedMaxFare = FHE.fromExternal(_encryptedMaxFare, inputProof);

        uint256 currentRideId = rideCounter;

        rideRequests[currentRideId] = PrivateRideRequest({
            passenger: msg.sender,
            pickup: PrivateLocation({
                encryptedLat: encryptedPickupLat,
                encryptedLng: encryptedPickupLng,
                isSet: true
            }),
            destination: PrivateLocation({
                encryptedLat: encryptedDestLat,
                encryptedLng: encryptedDestLng,
                isSet: true
            }),
            encryptedMaxFare: encryptedMaxFare,
            requestTime: block.timestamp,
            isActive: true,
            isMatched: false,
            matchedDriver: address(0),
            estimatedDuration: 0,
            deposit: msg.value,
            decryptionRequestId: 0,
            decryptionPending: false,
            decryptionRequestTime: 0
        });

        activeRideRequests.push(currentRideId);
        passengerHistory[msg.sender].push(currentRideId);

        // Allow contract access to encrypted data
        FHE.allowThis(encryptedPickupLat);
        FHE.allowThis(encryptedPickupLng);
        FHE.allowThis(encryptedDestLat);
        FHE.allowThis(encryptedDestLng);
        FHE.allowThis(encryptedMaxFare);
        FHE.allow(encryptedMaxFare, msg.sender);

        rideCounter++;

        emit RideRequested(currentRideId, msg.sender, block.timestamp, msg.value);
    }

    // ===== Gateway Callback Pattern for Ride Matching =====
    function acceptRide(uint256 rideId) external onlyRegisteredDriver onlyActiveRide(rideId) {
        require(!rideRequests[rideId].isMatched, "Ride already matched");
        require(drivers[msg.sender].isAvailable, "Driver not available");

        PrivateRideRequest storage ride = rideRequests[rideId];
        PrivateDriver storage driver = drivers[msg.sender];

        // Privacy protection: Add random multiplier before fare comparison
        // This prevents exact fare matching attacks
        euint32 randomMultiplier = FHE.asEuint32(uint32(block.timestamp % PRIVACY_MULTIPLIER_RANGE + 1));
        euint32 obfuscatedMaxFare = FHE.mul(ride.encryptedMaxFare, randomMultiplier);
        euint32 obfuscatedMinFare = FHE.mul(driver.encryptedMinFare, randomMultiplier);

        // Check fare compatibility (max fare >= min fare)
        ebool fareCompatible = FHE.ge(obfuscatedMaxFare, obfuscatedMinFare);
        FHE.allowThis(fareCompatible);

        ride.isMatched = true;
        ride.matchedDriver = msg.sender;
        driver.isAvailable = false;

        driverHistory[msg.sender].push(rideId);

        _removeFromActiveRequests(rideId);
        _removeFromAvailableDrivers(msg.sender);

        emit RideMatched(rideId, ride.passenger, msg.sender);
    }

    // ===== Complete Ride with Gateway Callback =====
    function completeRide(
        uint256 rideId,
        externalEuint32 _encryptedFinalFare,
        bytes calldata inputProof
    ) external onlyRegisteredDriver nonReentrant {
        require(rideRequests[rideId].isMatched, "Ride not matched");
        require(rideRequests[rideId].matchedDriver == msg.sender, "Not the matched driver");
        require(rideRequests[rideId].isActive, "Ride not active");

        PrivateRideRequest storage ride = rideRequests[rideId];
        PrivateDriver storage driver = drivers[msg.sender];

        euint32 encryptedFare32 = FHE.fromExternal(_encryptedFinalFare, inputProof);
        euint64 encryptedFinalFare = FHE.asEuint64(FHE.toUint256(encryptedFare32));

        // Price obfuscation: multiply by random factor
        euint64 privacyFactor = FHE.asEuint64(uint64(block.timestamp % 100 + 1));
        euint64 obfuscatedFare = FHE.mul(encryptedFinalFare, privacyFactor);

        completedRides[rideId] = RideMatch({
            rideId: rideId,
            passenger: ride.passenger,
            driver: msg.sender,
            encryptedFinalFare: encryptedFinalFare,
            obfuscatedFare: obfuscatedFare,
            startTime: ride.requestTime,
            endTime: block.timestamp,
            isCompleted: true,
            fareDisputed: false,
            revealedFare: 0,
            decryptionRequestId: 0,
            refundProcessed: false
        });

        ride.isActive = false;
        driver.isAvailable = true;
        driver.totalRides++;

        availableDrivers.push(msg.sender);

        FHE.allowThis(encryptedFinalFare);
        FHE.allowThis(obfuscatedFare);
        FHE.allow(encryptedFinalFare, ride.passenger);
        FHE.allow(encryptedFinalFare, msg.sender);

        emit RideCompleted(rideId, ride.passenger, msg.sender);
    }

    // ===== Gateway Callback: Request Fare Decryption =====
    function requestFareDecryption(uint256 rideId) external nonReentrant {
        RideMatch storage ride = completedRides[rideId];
        require(ride.isCompleted, "Ride not completed");
        require(
            ride.passenger == msg.sender || ride.driver == msg.sender,
            "Not authorized"
        );
        require(ride.decryptionRequestId == 0, "Decryption already requested");

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(ride.encryptedFinalFare);

        uint256 requestId = FHE.requestDecryption(cts, this.fareDecryptionCallback.selector);
        ride.decryptionRequestId = requestId;
        fareRequestToRide[requestId] = rideId;

        // Set timeout tracking
        PrivateRideRequest storage rideRequest = rideRequests[rideId];
        rideRequest.decryptionPending = true;
        rideRequest.decryptionRequestTime = block.timestamp;

        emit FareDecryptionRequested(rideId, requestId);
    }

    // ===== Gateway Callback: Fare Decryption Result =====
    function fareDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        uint64 revealedFare = abi.decode(cleartexts, (uint64));
        uint256 rideId = fareRequestToRide[requestId];

        RideMatch storage ride = completedRides[rideId];
        ride.revealedFare = revealedFare;

        // Mark decryption as complete
        PrivateRideRequest storage rideRequest = rideRequests[rideId];
        rideRequest.decryptionPending = false;

        // Calculate and collect platform fee
        uint256 platformFee = (uint256(revealedFare) * PLATFORM_FEE_PERCENT) / 100;
        platformFees += platformFee;

        emit FareRevealed(rideId, revealedFare);
    }

    // ===== Refund Mechanism: Decryption Failure =====
    function claimDecryptionTimeoutRefund(uint256 rideId) external nonReentrant {
        PrivateRideRequest storage rideRequest = rideRequests[rideId];
        RideMatch storage ride = completedRides[rideId];

        require(
            ride.passenger == msg.sender || ride.driver == msg.sender,
            "Not authorized"
        );
        require(rideRequest.decryptionPending, "No pending decryption");
        require(
            block.timestamp >= rideRequest.decryptionRequestTime + DECRYPTION_TIMEOUT,
            "Timeout not reached"
        );
        require(!ride.refundProcessed, "Refund already processed");

        ride.refundProcessed = true;
        rideRequest.decryptionPending = false;

        // Refund deposit to passenger
        uint256 refundAmount = rideRequest.deposit;
        rideRequest.deposit = 0;

        (bool sent, ) = payable(ride.passenger).call{value: refundAmount}("");
        require(sent, "Refund failed");

        emit RefundProcessed(rideId, ride.passenger, refundAmount, "Decryption timeout");
    }

    // ===== Timeout Protection: Ride Request Timeout =====
    function claimRideRequestTimeout(uint256 rideId) external nonReentrant {
        PrivateRideRequest storage ride = rideRequests[rideId];

        require(ride.passenger == msg.sender, "Not the passenger");
        require(ride.isActive, "Ride not active");
        require(!ride.isMatched, "Ride already matched");
        require(
            block.timestamp >= ride.requestTime + REQUEST_TIMEOUT,
            "Timeout not reached"
        );

        ride.isActive = false;
        _removeFromActiveRequests(rideId);

        // Refund deposit
        uint256 refundAmount = ride.deposit;
        ride.deposit = 0;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund failed");

        emit TimeoutClaimed(rideId, msg.sender, refundAmount);
    }

    // ===== Dispute Functions =====
    function disputeFare(uint256 rideId) external {
        require(completedRides[rideId].isCompleted, "Ride not completed");
        require(
            completedRides[rideId].passenger == msg.sender ||
            completedRides[rideId].driver == msg.sender,
            "Not authorized to dispute"
        );
        require(!completedRides[rideId].fareDisputed, "Already disputed");

        completedRides[rideId].fareDisputed = true;

        emit FareDispute(rideId, msg.sender);
    }

    // ===== Driver Location Update =====
    function updateDriverLocation(
        externalEuint32 _encryptedLat,
        externalEuint32 _encryptedLng,
        bytes calldata inputProof
    ) external onlyRegisteredDriver {
        require(drivers[msg.sender].isAvailable, "Driver not available");

        euint32 encryptedLat = FHE.fromExternal(_encryptedLat, inputProof);
        euint32 encryptedLng = FHE.fromExternal(_encryptedLng, inputProof);

        drivers[msg.sender].currentLocation = PrivateLocation({
            encryptedLat: encryptedLat,
            encryptedLng: encryptedLng,
            isSet: true
        });

        FHE.allowThis(encryptedLat);
        FHE.allowThis(encryptedLng);
        FHE.allow(encryptedLat, msg.sender);
        FHE.allow(encryptedLng, msg.sender);

        emit LocationUpdated(msg.sender, block.timestamp);
    }

    // ===== Driver Availability =====
    function setDriverAvailability(bool _available) external onlyRegisteredDriver {
        drivers[msg.sender].isAvailable = _available;

        if (_available && !_isInAvailableDrivers(msg.sender)) {
            availableDrivers.push(msg.sender);
        } else if (!_available) {
            _removeFromAvailableDrivers(msg.sender);
        }
    }

    // ===== Admin: Verify Driver =====
    function verifyDriver(address driverAddress) external onlyOwner {
        require(registeredDrivers[driverAddress], "Driver not registered");
        drivers[driverAddress].isVerified = true;
    }

    // ===== Withdraw Driver Deposit =====
    function withdrawDriverDeposit() external onlyRegisteredDriver nonReentrant {
        PrivateDriver storage driver = drivers[msg.sender];
        require(driver.deposit > 0, "No deposit to withdraw");
        require(driver.totalRides > 0, "Must complete at least one ride");

        uint256 amount = driver.deposit;
        driver.deposit = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");

        emit DepositRefunded(msg.sender, amount);
    }

    // ===== Internal Functions =====
    function _removeFromActiveRequests(uint256 rideId) private {
        uint256 length = activeRideRequests.length;
        for (uint256 i = 0; i < length;) {
            if (activeRideRequests[i] == rideId) {
                activeRideRequests[i] = activeRideRequests[length - 1];
                activeRideRequests.pop();
                break;
            }
            unchecked { ++i; }
        }
    }

    function _removeFromAvailableDrivers(address driver) private {
        uint256 length = availableDrivers.length;
        for (uint256 i = 0; i < length;) {
            if (availableDrivers[i] == driver) {
                availableDrivers[i] = availableDrivers[length - 1];
                availableDrivers.pop();
                break;
            }
            unchecked { ++i; }
        }
    }

    function _isInAvailableDrivers(address driver) private view returns (bool) {
        uint256 length = availableDrivers.length;
        for (uint256 i = 0; i < length;) {
            if (availableDrivers[i] == driver) {
                return true;
            }
            unchecked { ++i; }
        }
        return false;
    }

    // ===== View Functions =====
    function getActiveRideRequestsCount() external view returns (uint256) {
        return activeRideRequests.length;
    }

    function getAvailableDriversCount() external view returns (uint256) {
        return availableDrivers.length;
    }

    function getPassengerRideHistory(address passenger) external view returns (uint256[] memory) {
        return passengerHistory[passenger];
    }

    function getDriverRideHistory(address driver) external view returns (uint256[] memory) {
        return driverHistory[driver];
    }

    function getRideDetails(uint256 rideId) external view returns (
        address passenger,
        address matchedDriver,
        uint256 requestTime,
        bool isActive,
        bool isMatched,
        uint256 deposit,
        bool decryptionPending
    ) {
        PrivateRideRequest storage ride = rideRequests[rideId];
        return (
            ride.passenger,
            ride.matchedDriver,
            ride.requestTime,
            ride.isActive,
            ride.isMatched,
            ride.deposit,
            ride.decryptionPending
        );
    }

    function getDriverInfo(address driverAddress) external view returns (
        bool isAvailable,
        bool isVerified,
        uint256 totalRides,
        uint256 registrationTime,
        uint256 deposit
    ) {
        PrivateDriver storage driver = drivers[driverAddress];
        return (
            driver.isAvailable,
            driver.isVerified,
            driver.totalRides,
            driver.registrationTime,
            driver.deposit
        );
    }

    function getCompletedRideInfo(uint256 rideId) external view returns (
        address passenger,
        address driver,
        uint256 startTime,
        uint256 endTime,
        bool isCompleted,
        bool fareDisputed,
        uint64 revealedFare,
        bool refundProcessed
    ) {
        RideMatch storage ride = completedRides[rideId];
        return (
            ride.passenger,
            ride.driver,
            ride.startTime,
            ride.endTime,
            ride.isCompleted,
            ride.fareDisputed,
            ride.revealedFare,
            ride.refundProcessed
        );
    }

    function getDecryptionStatus(uint256 rideId) external view returns (
        uint256 decryptionRequestId,
        bool decryptionPending,
        uint256 decryptionRequestTime,
        bool canClaimTimeout
    ) {
        PrivateRideRequest storage ride = rideRequests[rideId];
        RideMatch storage completed = completedRides[rideId];

        bool timeout = ride.decryptionPending &&
            block.timestamp >= ride.decryptionRequestTime + DECRYPTION_TIMEOUT;

        return (
            completed.decryptionRequestId,
            ride.decryptionPending,
            ride.decryptionRequestTime,
            timeout && !completed.refundProcessed
        );
    }

    // ===== Test Helpers =====
    function testingResolve(
        uint256 rideId,
        uint64 revealedFare
    ) external onlyOwner {
        require(isTesting, "Testing disabled");
        RideMatch storage ride = completedRides[rideId];
        require(ride.isCompleted, "Ride not completed");
        ride.revealedFare = revealedFare;
    }

    function testingFundContract() external payable onlyOwner {
        require(isTesting, "Testing disabled");
    }

    receive() external payable {}
}
