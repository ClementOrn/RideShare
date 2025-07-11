// Private Ride Share DApp
class PrivateRideShareApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.fhevm = null;
        this.userAddress = null;

        // Contract configuration
        this.contractAddress = "0x87288E6cEE215e01d2704c0d4d01EAF1d192659d"; // Replace with actual deployed contract address
        this.contractABI = [
            "function registerDriver(uint32 _initialLat, uint32 _initialLng, uint32 _minFare) external",
            "function requestRide(uint32 _pickupLat, uint32 _pickupLng, uint32 _destinationLat, uint32 _destinationLng, uint32 _maxFare) external",
            "function updateDriverLocation(uint32 _newLat, uint32 _newLng) external",
            "function acceptRide(uint256 rideId) external",
            "function completeRide(uint256 rideId, uint32 _finalFare) external",
            "function setDriverAvailability(bool _available) external",
            "function disputeFare(uint256 rideId) external",
            "function getActiveRideRequestsCount() external view returns (uint256)",
            "function getAvailableDriversCount() external view returns (uint256)",
            "function getPassengerRideHistory(address passenger) external view returns (uint256[])",
            "function getDriverRideHistory(address driver) external view returns (uint256[])",
            "function getRideDetails(uint256 rideId) external view returns (address passenger, address matchedDriver, uint256 requestTime, bool isActive, bool isMatched)",
            "function getDriverInfo(address driverAddress) external view returns (bool isAvailable, bool isVerified, uint256 totalRides, uint256 registrationTime)",
            "function getCompletedRideInfo(uint256 rideId) external view returns (address passenger, address driver, uint256 startTime, uint256 endTime, bool isCompleted, bool fareDisputed)",
            "function registeredDrivers(address) external view returns (bool)",
            "function rideCounter() external view returns (uint256)",
            "event RideRequested(uint256 indexed rideId, address indexed passenger, uint256 timestamp)",
            "event DriverRegistered(address indexed driver, uint256 timestamp)",
            "event RideMatched(uint256 indexed rideId, address indexed passenger, address indexed driver)",
            "event RideCompleted(uint256 indexed rideId, address indexed passenger, address indexed driver)",
            "event LocationUpdated(address indexed driver, uint256 timestamp)",
            "event FareDispute(uint256 indexed rideId, address indexed disputer)"
        ];

        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        await this.checkWalletConnection();
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());

        // Forms
        document.getElementById('requestRideForm').addEventListener('submit', (e) => this.handleRequestRide(e));
        document.getElementById('registerDriverForm').addEventListener('submit', (e) => this.handleRegisterDriver(e));

        // Driver actions
        document.getElementById('updateLocationBtn').addEventListener('click', () => this.updateDriverLocation());
        document.getElementById('toggleAvailabilityBtn').addEventListener('click', () => this.toggleDriverAvailability());
        document.getElementById('refreshRidesBtn').addEventListener('click', () => this.loadAvailableRides());
        document.getElementById('refreshHistoryBtn').addEventListener('click', () => this.loadRideHistory());
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showMessage('Please install MetaMask to use this application.', 'error');
                return;
            }

            this.showLoading(true);

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Initialize FHEVM
            try {
                this.fhevm = await createFhevmInstance({
                    network: window.ethereum.networkVersion,
                    gatewayUrl: "https://gateway.sepolia.zama.ai"
                });
            } catch (error) {
                console.warn('FHE initialization failed, continuing with basic functionality:', error);
            }

            // Initialize contract
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

            // Update UI
            this.updateWalletUI();
            await this.updateDriverStatus();
            await this.loadRideHistory();

            this.showMessage('Wallet connected successfully!', 'success');
            this.showLoading(false);

        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showMessage('Failed to connect wallet: ' + error.message, 'error');
            this.showLoading(false);
        }
    }

    updateWalletUI() {
        const button = document.getElementById('connectWallet');
        const addressElement = document.getElementById('walletAddress');
        const networkElement = document.getElementById('networkName');

        if (this.userAddress) {
            button.textContent = 'Connected';
            button.disabled = true;
            addressElement.textContent = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;

            this.provider.getNetwork().then(network => {
                networkElement.textContent = network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name;
            });
        }
    }

    async updateDriverStatus() {
        if (!this.contract || !this.userAddress) return;

        try {
            const isRegistered = await this.contract.registeredDrivers(this.userAddress);
            if (isRegistered) {
                const driverInfo = await this.contract.getDriverInfo(this.userAddress);
                document.getElementById('totalRides').textContent = driverInfo.totalRides.toString();
                document.getElementById('driverStatus').textContent = driverInfo.isVerified ? 'Verified' : 'Registered';
            }

            const activeRides = await this.contract.getActiveRideRequestsCount();
            document.getElementById('availableRides').textContent = activeRides.toString();

        } catch (error) {
            console.error('Error updating driver status:', error);
        }
    }

    async handleRequestRide(event) {
        event.preventDefault();

        if (!this.contract) {
            this.showMessage('Please connect your wallet first.', 'error');
            return;
        }

        const formData = new FormData(event.target);
        const pickupLat = Math.floor(parseFloat(document.getElementById('pickupLat').value) * 1000000);
        const pickupLng = Math.floor(parseFloat(document.getElementById('pickupLng').value) * 1000000);
        const destLat = Math.floor(parseFloat(document.getElementById('destLat').value) * 1000000);
        const destLng = Math.floor(parseFloat(document.getElementById('destLng').value) * 1000000);
        const maxFare = parseInt(document.getElementById('maxFare').value);

        try {
            this.showLoading(true);
            const tx = await this.contract.requestRide(pickupLat, pickupLng, destLat, destLng, maxFare);
            await tx.wait();

            this.showMessage('Ride requested successfully! Waiting for driver acceptance.', 'success');
            event.target.reset();
            await this.loadRideHistory();

        } catch (error) {
            console.error('Error requesting ride:', error);
            this.showMessage('Failed to request ride: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegisterDriver(event) {
        event.preventDefault();

        if (!this.contract) {
            this.showMessage('Please connect your wallet first.', 'error');
            return;
        }

        const lat = Math.floor(parseFloat(document.getElementById('driverLat').value) * 1000000);
        const lng = Math.floor(parseFloat(document.getElementById('driverLng').value) * 1000000);
        const minFare = parseInt(document.getElementById('minFare').value);

        try {
            this.showLoading(true);
            const tx = await this.contract.registerDriver(lat, lng, minFare);
            await tx.wait();

            this.showMessage('Successfully registered as driver!', 'success');
            event.target.reset();
            await this.updateDriverStatus();

        } catch (error) {
            console.error('Error registering driver:', error);
            this.showMessage('Failed to register as driver: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async updateDriverLocation() {
        if (!this.contract) {
            this.showMessage('Please connect your wallet first.', 'error');
            return;
        }

        const lat = prompt('Enter new latitude (e.g., 40.7128):');
        const lng = prompt('Enter new longitude (e.g., -74.0060):');

        if (!lat || !lng) return;

        try {
            this.showLoading(true);
            const latInt = Math.floor(parseFloat(lat) * 1000000);
            const lngInt = Math.floor(parseFloat(lng) * 1000000);

            const tx = await this.contract.updateDriverLocation(latInt, lngInt);
            await tx.wait();

            this.showMessage('Location updated successfully!', 'success');

        } catch (error) {
            console.error('Error updating location:', error);
            this.showMessage('Failed to update location: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async toggleDriverAvailability() {
        if (!this.contract) {
            this.showMessage('Please connect your wallet first.', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const driverInfo = await this.contract.getDriverInfo(this.userAddress);
            const newAvailability = !driverInfo.isAvailable;

            const tx = await this.contract.setDriverAvailability(newAvailability);
            await tx.wait();

            this.showMessage(`Driver availability set to: ${newAvailability ? 'Available' : 'Unavailable'}`, 'success');
            await this.updateDriverStatus();

        } catch (error) {
            console.error('Error toggling availability:', error);
            this.showMessage('Failed to toggle availability: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadAvailableRides() {
        if (!this.contract) return;

        try {
            const rideCount = await this.contract.rideCounter();
            const ridesList = document.getElementById('availableRidesList');
            ridesList.innerHTML = '';

            for (let i = 1; i < rideCount; i++) {
                try {
                    const rideDetails = await this.contract.getRideDetails(i);
                    if (rideDetails.isActive && !rideDetails.isMatched) {
                        const rideCard = this.createRideCard(i, rideDetails, 'available');
                        ridesList.appendChild(rideCard);
                    }
                } catch (error) {
                    console.warn(`Error loading ride ${i}:`, error);
                }
            }

            if (ridesList.children.length === 0) {
                ridesList.innerHTML = '<p style="text-align: center; color: #666;">No available rides at the moment.</p>';
            }

        } catch (error) {
            console.error('Error loading available rides:', error);
        }
    }

    async acceptRide(rideId) {
        if (!this.contract) return;

        try {
            this.showLoading(true);
            const tx = await this.contract.acceptRide(rideId);
            await tx.wait();

            this.showMessage(`Ride #${rideId} accepted successfully!`, 'success');
            await this.loadAvailableRides();
            await this.loadRideHistory();

        } catch (error) {
            console.error('Error accepting ride:', error);
            this.showMessage('Failed to accept ride: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async completeRide(rideId) {
        if (!this.contract) return;

        const finalFare = prompt('Enter final fare (in Wei):');
        if (!finalFare) return;

        try {
            this.showLoading(true);
            const tx = await this.contract.completeRide(rideId, parseInt(finalFare));
            await tx.wait();

            this.showMessage(`Ride #${rideId} completed successfully!`, 'success');
            await this.loadRideHistory();

        } catch (error) {
            console.error('Error completing ride:', error);
            this.showMessage('Failed to complete ride: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadRideHistory() {
        if (!this.contract || !this.userAddress) return;

        try {
            const passengerRides = await this.contract.getPassengerRideHistory(this.userAddress);
            const driverRides = await this.contract.getDriverRideHistory(this.userAddress);

            const allRideIds = [...new Set([...passengerRides.map(r => r.toString()), ...driverRides.map(r => r.toString())])];

            const historyList = document.getElementById('rideHistoryList');
            historyList.innerHTML = '';

            for (const rideId of allRideIds) {
                try {
                    const rideDetails = await this.contract.getRideDetails(rideId);
                    const isDriver = rideDetails.matchedDriver.toLowerCase() === this.userAddress.toLowerCase();
                    const rideCard = this.createRideCard(rideId, rideDetails, isDriver ? 'driver' : 'passenger');
                    historyList.appendChild(rideCard);
                } catch (error) {
                    console.warn(`Error loading ride history ${rideId}:`, error);
                }
            }

            if (historyList.children.length === 0) {
                historyList.innerHTML = '<p style="text-align: center; color: #666;">No ride history found.</p>';
            }

        } catch (error) {
            console.error('Error loading ride history:', error);
        }
    }

    createRideCard(rideId, rideDetails, type) {
        const card = document.createElement('div');
        card.className = 'ride-card';

        const status = rideDetails.isMatched ?
            (rideDetails.isActive ? 'matched' : 'completed') : 'active';

        const statusText = rideDetails.isMatched ?
            (rideDetails.isActive ? 'Matched' : 'Completed') : 'Active';

        card.innerHTML = `
            <h4><i class="fas fa-car icon"></i>Ride #${rideId}</h4>
            <div class="ride-info">
                <span><strong>Passenger:</strong> ${rideDetails.passenger.slice(0, 8)}...</span>
                <span class="status-badge status-${status}">${statusText}</span>
            </div>
            <div class="ride-info">
                <span><strong>Requested:</strong> ${new Date(rideDetails.requestTime * 1000).toLocaleString()}</span>
            </div>
            ${rideDetails.matchedDriver !== '0x0000000000000000000000000000000000000000' ?
                `<div class="ride-info">
                    <span><strong>Driver:</strong> ${rideDetails.matchedDriver.slice(0, 8)}...</span>
                </div>` : ''
            }
            ${type === 'available' ? `
                <button class="btn btn-success" onclick="app.acceptRide(${rideId})" style="margin-top: 10px;">
                    <i class="fas fa-check icon"></i>Accept Ride
                </button>
            ` : ''}
            ${type === 'driver' && rideDetails.isMatched && rideDetails.isActive ? `
                <button class="btn btn-secondary" onclick="app.completeRide(${rideId})" style="margin-top: 10px;">
                    <i class="fas fa-flag-checkered icon"></i>Complete Ride
                </button>
            ` : ''}
        `;

        return card;
    }

    showMessage(message, type = 'info') {
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} icon"></i>${message}`;

        messagesDiv.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.classList.toggle('show', show);
    }
}

// Tab switching function
function showTab(tabName) {
    // Hide all tab contents
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Add active class to clicked tab button
    event.target.classList.add('active');

    // Load data for specific tabs
    if (tabName === 'driver' && window.app) {
        window.app.loadAvailableRides();
    } else if (tabName === 'rides' && window.app) {
        window.app.loadRideHistory();
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    window.app = new PrivateRideShareApp();
});

// Handle account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            location.reload();
        } else {
            window.app.connectWallet();
        }
    });

    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}