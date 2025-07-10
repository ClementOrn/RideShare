// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateRideShare
 * @notice Privacy-preserving ride-sharing platform using FHE
 * @dev Simplified version for Hardhat framework demonstration
 */
contract PrivateRideShare is SepoliaConfig {
    
    address public owner;
    uint256 public rideCounter;
    uint256 public driverCounter;
    
    // Pauser mechanism
    mapping(address => bool) public pausers;
    bool public paused;
    
    // Driver registration tracking
    mapping(address => bool) public registeredDrivers;
    
    // Events
    event DriverRegistered(address indexed driver, uint256 timestamp);
    event RideRequested(uint256 indexed rideId, address indexed passenger, uint256 timestamp);
    event DriverVerified(address indexed driver);
    event Paused(address account);
    event Unpaused(address account);
    
    // Basic driver info (simplified)
    struct DriverInfo {
        bool isAvailable;
        bool isVerified;
        uint256 totalRides;
        uint256 registrationTime;
    }
    
    mapping(address => DriverInfo) public drivers;
    
    // Basic ride info (simplified)
    struct RideInfo {
        address passenger;
        address matchedDriver;
        uint256 requestTime;
        bool isActive;
        bool isMatched;
    }
    
    mapping(uint256 => RideInfo) public rideRequests;
    
    // Ride history
    mapping(address => uint256[]) private passengerRideHistory;
    mapping(address => uint256[]) private driverRideHistory;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyPauser() {
        require(pausers[msg.sender] || msg.sender == owner, "Not pauser");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    modifier whenPaused() {
        require(paused, "Contract not paused");
        _;
    }
    
    modifier onlyRegisteredDriver() {
        require(registeredDrivers[msg.sender], "Not registered driver");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        pausers[msg.sender] = true;
        rideCounter = 1;
        driverCounter = 0;
    }
    
    // ==========================================
    // OWNER FUNCTIONS
    // ==========================================
    
    function addPauser(address _pauser) external onlyOwner {
        pausers[_pauser] = true;
    }
    
    function removePauser(address _pauser) external onlyOwner {
        require(_pauser != owner, "Cannot remove owner");
        pausers[_pauser] = false;
    }
    
    function verifyDriver(address _driver) external onlyOwner {
        require(registeredDrivers[_driver], "Driver not registered");
        drivers[_driver].isVerified = true;
        emit DriverVerified(_driver);
    }
    
    function pause() external onlyPauser whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyPauser whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    // ==========================================
    // DRIVER FUNCTIONS
    // ==========================================
    
    function registerDriver() external whenNotPaused {
        require(!registeredDrivers[msg.sender], "Already registered");
        
        registeredDrivers[msg.sender] = true;
        driverCounter++;
        
        drivers[msg.sender] = DriverInfo({
            isAvailable: true,
            isVerified: false,
            totalRides: 0,
            registrationTime: block.timestamp
        });
        
        emit DriverRegistered(msg.sender, block.timestamp);
    }
    
    function setDriverAvailability(bool _available) external onlyRegisteredDriver {
        drivers[msg.sender].isAvailable = _available;
    }
    
    function acceptRide(uint256 _rideId) external onlyRegisteredDriver whenNotPaused {
        require(rideRequests[_rideId].isActive, "Ride not active");
        require(!rideRequests[_rideId].isMatched, "Ride already matched");
        
        rideRequests[_rideId].isMatched = true;
        rideRequests[_rideId].matchedDriver = msg.sender;
        
        driverRideHistory[msg.sender].push(_rideId);
    }
    
    function completeRide(uint256 _rideId) external onlyRegisteredDriver {
        require(rideRequests[_rideId].isMatched, "Ride not matched");
        require(rideRequests[_rideId].matchedDriver == msg.sender, "Not matched driver");
        
        rideRequests[_rideId].isActive = false;
        drivers[msg.sender].totalRides++;
    }
    
    // ==========================================
    // PASSENGER FUNCTIONS
    // ==========================================
    
    function requestRide() external whenNotPaused {
        uint256 currentRideId = rideCounter;
        
        rideRequests[currentRideId] = RideInfo({
            passenger: msg.sender,
            matchedDriver: address(0),
            requestTime: block.timestamp,
            isActive: true,
            isMatched: false
        });
        
        passengerRideHistory[msg.sender].push(currentRideId);
        
        emit RideRequested(currentRideId, msg.sender, block.timestamp);
        rideCounter++;
    }
    
    function cancelRide(uint256 _rideId) external {
        require(rideRequests[_rideId].passenger == msg.sender, "Not your ride");
        require(!rideRequests[_rideId].isMatched, "Ride already matched");
        
        rideRequests[_rideId].isActive = false;
    }
    
    // ==========================================
    // VIEW FUNCTIONS
    // ==========================================
    
    function getDriverInfo(address _driver) external view returns (
        bool isAvailable,
        bool isVerified,
        uint256 totalRides,
        uint256 registrationTime
    ) {
        DriverInfo memory info = drivers[_driver];
        return (info.isAvailable, info.isVerified, info.totalRides, info.registrationTime);
    }
    
    function getRideDetails(uint256 _rideId) external view returns (
        address passenger,
        address matchedDriver,
        uint256 requestTime,
        bool isActive,
        bool isMatched
    ) {
        RideInfo memory ride = rideRequests[_rideId];
        return (ride.passenger, ride.matchedDriver, ride.requestTime, ride.isActive, ride.isMatched);
    }
    
    function getPassengerRideHistory(address _passenger) external view returns (uint256[] memory) {
        return passengerRideHistory[_passenger];
    }
    
    function getDriverRideHistory(address _driver) external view returns (uint256[] memory) {
        return driverRideHistory[_driver];
    }
    
    function getActiveRideRequestsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < rideCounter; i++) {
            if (rideRequests[i].isActive && !rideRequests[i].isMatched) {
                count++;
            }
        }
        return count;
    }
    
    function getAvailableDriversCount() external view returns (uint256) {
        // Note: This is a simplified implementation
        // In production, maintain a separate counter
        return driverCounter;
    }
}
