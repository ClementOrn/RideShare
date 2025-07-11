// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateRideShare is SepoliaConfig {

    address public owner;
    uint256 public rideCounter;
    uint256 public driverCounter;

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
    }

    struct PrivateDriver {
        address driverAddress;
        PrivateLocation currentLocation;
        euint32 encryptedMinFare;
        bool isAvailable;
        bool isVerified;
        uint256 totalRides;
        uint256 registrationTime;
    }

    struct RideMatch {
        uint256 rideId;
        address passenger;
        address driver;
        euint64 encryptedFinalFare;
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
        bool fareDisputed;
    }

    mapping(uint256 => PrivateRideRequest) public rideRequests;
    mapping(address => PrivateDriver) public drivers;
    mapping(uint256 => RideMatch) public completedRides;
    mapping(address => uint256[]) public passengerHistory;
    mapping(address => uint256[]) public driverHistory;
    mapping(address => bool) public registeredDrivers;

    uint256[] public activeRideRequests;
    address[] public availableDrivers;

    event RideRequested(uint256 indexed rideId, address indexed passenger, uint256 timestamp);
    event DriverRegistered(address indexed driver, uint256 timestamp);
    event RideMatched(uint256 indexed rideId, address indexed passenger, address indexed driver);
    event RideCompleted(uint256 indexed rideId, address indexed passenger, address indexed driver);
    event LocationUpdated(address indexed driver, uint256 timestamp);
    event FareDispute(uint256 indexed rideId, address indexed disputer);

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

    constructor() {
        owner = msg.sender;
        rideCounter = 1;
        driverCounter = 0;
    }

    function registerDriver(
        uint32 _initialLat,
        uint32 _initialLng,
        uint32 _minFare
    ) external {
        require(!registeredDrivers[msg.sender], "Already registered as driver");

        euint32 encryptedLat = FHE.asEuint32(_initialLat);
        euint32 encryptedLng = FHE.asEuint32(_initialLng);
        euint32 encryptedMinFare = FHE.asEuint32(_minFare);

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
            registrationTime: block.timestamp
        });

        registeredDrivers[msg.sender] = true;
        availableDrivers.push(msg.sender);
        driverCounter++;

        FHE.allowThis(encryptedLat);
        FHE.allowThis(encryptedLng);
        FHE.allowThis(encryptedMinFare);
        FHE.allow(encryptedLat, msg.sender);
        FHE.allow(encryptedLng, msg.sender);
        FHE.allow(encryptedMinFare, msg.sender);

        emit DriverRegistered(msg.sender, block.timestamp);
    }

    function requestRide(
        uint32 _pickupLat,
        uint32 _pickupLng,
        uint32 _destinationLat,
        uint32 _destinationLng,
        uint32 _maxFare
    ) external {
        require(_maxFare > 0, "Max fare must be positive");

        euint32 encryptedPickupLat = FHE.asEuint32(_pickupLat);
        euint32 encryptedPickupLng = FHE.asEuint32(_pickupLng);
        euint32 encryptedDestLat = FHE.asEuint32(_destinationLat);
        euint32 encryptedDestLng = FHE.asEuint32(_destinationLng);
        euint32 encryptedMaxFare = FHE.asEuint32(_maxFare);

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
            estimatedDuration: 0
        });

        activeRideRequests.push(currentRideId);
        passengerHistory[msg.sender].push(currentRideId);

        FHE.allowThis(encryptedPickupLat);
        FHE.allowThis(encryptedPickupLng);
        FHE.allowThis(encryptedDestLat);
        FHE.allowThis(encryptedDestLng);
        FHE.allowThis(encryptedMaxFare);
        FHE.allow(encryptedMaxFare, msg.sender);

        rideCounter++;

        emit RideRequested(currentRideId, msg.sender, block.timestamp);
    }

    function updateDriverLocation(
        uint32 _newLat,
        uint32 _newLng
    ) external onlyRegisteredDriver {
        require(drivers[msg.sender].isAvailable, "Driver not available");

        euint32 encryptedLat = FHE.asEuint32(_newLat);
        euint32 encryptedLng = FHE.asEuint32(_newLng);

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

    function acceptRide(uint256 rideId) external onlyRegisteredDriver onlyActiveRide(rideId) {
        require(!rideRequests[rideId].isMatched, "Ride already matched");
        require(drivers[msg.sender].isAvailable, "Driver not available");

        PrivateRideRequest storage ride = rideRequests[rideId];
        PrivateDriver storage driver = drivers[msg.sender];

        ride.isMatched = true;
        ride.matchedDriver = msg.sender;
        driver.isAvailable = false;

        driverHistory[msg.sender].push(rideId);

        _removeFromActiveRequests(rideId);
        _removeFromAvailableDrivers(msg.sender);

        emit RideMatched(rideId, ride.passenger, msg.sender);
    }

    function completeRide(
        uint256 rideId,
        uint32 _finalFare
    ) external onlyRegisteredDriver {
        require(rideRequests[rideId].isMatched, "Ride not matched");
        require(rideRequests[rideId].matchedDriver == msg.sender, "Not the matched driver");
        require(rideRequests[rideId].isActive, "Ride not active");

        PrivateRideRequest storage ride = rideRequests[rideId];
        PrivateDriver storage driver = drivers[msg.sender];

        euint64 encryptedFinalFare = FHE.asEuint64(uint64(_finalFare));

        completedRides[rideId] = RideMatch({
            rideId: rideId,
            passenger: ride.passenger,
            driver: msg.sender,
            encryptedFinalFare: encryptedFinalFare,
            startTime: ride.requestTime,
            endTime: block.timestamp,
            isCompleted: true,
            fareDisputed: false
        });

        ride.isActive = false;
        driver.isAvailable = true;
        driver.totalRides++;

        availableDrivers.push(msg.sender);

        FHE.allowThis(encryptedFinalFare);
        FHE.allow(encryptedFinalFare, ride.passenger);
        FHE.allow(encryptedFinalFare, msg.sender);

        emit RideCompleted(rideId, ride.passenger, msg.sender);
    }

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

    function setDriverAvailability(bool _available) external onlyRegisteredDriver {
        drivers[msg.sender].isAvailable = _available;

        if (_available && !_isInAvailableDrivers(msg.sender)) {
            availableDrivers.push(msg.sender);
        } else if (!_available) {
            _removeFromAvailableDrivers(msg.sender);
        }
    }

    function verifyDriver(address driverAddress) external onlyOwner {
        require(registeredDrivers[driverAddress], "Driver not registered");
        drivers[driverAddress].isVerified = true;
    }

    function _removeFromActiveRequests(uint256 rideId) private {
        for (uint i = 0; i < activeRideRequests.length; i++) {
            if (activeRideRequests[i] == rideId) {
                activeRideRequests[i] = activeRideRequests[activeRideRequests.length - 1];
                activeRideRequests.pop();
                break;
            }
        }
    }

    function _removeFromAvailableDrivers(address driver) private {
        for (uint i = 0; i < availableDrivers.length; i++) {
            if (availableDrivers[i] == driver) {
                availableDrivers[i] = availableDrivers[availableDrivers.length - 1];
                availableDrivers.pop();
                break;
            }
        }
    }

    function _isInAvailableDrivers(address driver) private view returns (bool) {
        for (uint i = 0; i < availableDrivers.length; i++) {
            if (availableDrivers[i] == driver) {
                return true;
            }
        }
        return false;
    }

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
        bool isMatched
    ) {
        PrivateRideRequest storage ride = rideRequests[rideId];
        return (
            ride.passenger,
            ride.matchedDriver,
            ride.requestTime,
            ride.isActive,
            ride.isMatched
        );
    }

    function getDriverInfo(address driverAddress) external view returns (
        bool isAvailable,
        bool isVerified,
        uint256 totalRides,
        uint256 registrationTime
    ) {
        PrivateDriver storage driver = drivers[driverAddress];
        return (
            driver.isAvailable,
            driver.isVerified,
            driver.totalRides,
            driver.registrationTime
        );
    }

    function getCompletedRideInfo(uint256 rideId) external view returns (
        address passenger,
        address driver,
        uint256 startTime,
        uint256 endTime,
        bool isCompleted,
        bool fareDisputed
    ) {
        RideMatch storage ride = completedRides[rideId];
        return (
            ride.passenger,
            ride.driver,
            ride.startTime,
            ride.endTime,
            ride.isCompleted,
            ride.fareDisputed
        );
    }
}