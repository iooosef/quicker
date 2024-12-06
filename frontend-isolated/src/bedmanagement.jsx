import React, { useState } from 'react';
import './bedmanagement.css';
import quicker from './assets/quicker.png';
import { useNavigate } from 'react-router-dom';

// BedManagement Component
function BedManagement({ addBed, beds, updateBedStatus }) {
  const [bedNumber, setBedNumber] = useState(''); // Bed Number
  const [patient, setPatient] = useState(''); // Patient's Name
  const [status, setStatus] = useState('Available'); // Default status is "Available"
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Search query for patient names
  const [isModalOpen, setIsModalOpen] = useState(false); // Toggle modal visibility
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Update modal toggle
  const [selectedBed, setSelectedBed] = useState(null); // Track selected bed for update

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check if the bed number already exists
    if (beds.some((bed) => bed.bedNumber === bedNumber)) {
      alert('This Bed ID already exists. Please choose a different one.'); // Popup alert for duplicate bed ID
      return;
    }

    if (!bedNumber || !patient) {
      setError('Please fill in all fields');
      return;
    }

    const newBed = {
      id: Date.now(),
      bedNumber,
      patient,
      status,
    };

    addBed(newBed);
    setBedNumber('');
    setPatient('');
    setStatus('Available');
    setIsModalOpen(false); // Close the modal after submission
  };

  const handleUpdateStatus = (bed) => {
    setSelectedBed({ ...bed }); // Create a copy to allow editing
    setStatus(bed.status);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (selectedBed) {
      // Do not change the bed number, only update status and patient's name
      const updatedPatient = selectedBed.status === "Available" || selectedBed.status === "Reserved"
        ? selectedBed.patient // Keep the current patient even if the status is "Occupied" or "Reserved"
        : "-"; // Use empty patient when available

      // Update the bed with the new status and patient name
      updateBedStatus(selectedBed.id, selectedBed.status, updatedPatient);
      setIsUpdateModalOpen(false); // Close the modal after submission
    }
  };

  // Generate a list of bed numbers (e.g., "Bed 01", "Bed 02", ...)
  const generateBedNumbers = () => {
    const totalBeds = 20; // Assume 20 beds available
    let bedNumbers = [];
    for (let i = 1; i <= totalBeds; i++) {
      bedNumbers.push(`Bed ${String(i).padStart(2, '0')}`);
    }
    return bedNumbers;
  };

  // Filter beds based on the search query
  const filteredBeds = beds.filter((bed) =>
    bed.patient.toLowerCase().includes(searchQuery.toLowerCase()) || bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bed-management-container">
      <h3>Bed Management</h3>
      <button onClick={() => setIsModalOpen(true)} className="add-bed-button">
        Add Bed
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Add New Bed</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-container">
                <label>
                  Bed Number:
                  <select
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    required
                  >
                    <option value="">Select Bed</option>
                    {generateBedNumbers().map((bedNum) => (
                      <option key={bedNum} value={bedNum}>
                        {bedNum}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                
                </label>
                <label>
                  Status:
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </label>
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="close-modal-button"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && selectedBed && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Update Bed Status</h4>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-container">
                <label>
                  Bed Number: {selectedBed.bedNumber}
                </label>
                <label>
       
                  <input
                    type="text"
                    value={selectedBed.patient}
                    onChange={(e) => setSelectedBed({ ...selectedBed, patient: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Status:
                  <select
                    value={selectedBed.status}
                    onChange={(e) => setSelectedBed({ ...selectedBed, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </label>
                <button type="submit">Update Status</button>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="close-modal-button"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <div className="table-container">
        <div className="search-container">
        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-bar"
                        
                        />
        </div>
        <table className="patients-table">
          <thead>
            <tr>
              <th>Bed ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBeds.map((bed) => (
              <tr key={bed.id}>
                <td>{bed.bedNumber}</td>
                <td>{bed.status === "Available" || bed.status === "Reserved" ? "-" : bed.patient}</td>
                <td>{bed.status}</td>
                <td>
                  <button type="button" onClick={() => handleUpdateStatus(bed)}>
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const Sidebar = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  const handleLogout = () => {
    setShowModal(false); // Close modal
    navigate('/LoginForm'); // Navigate to the login page
  };
// Sidebar Component
return (
  <div className="emergency-room-container">
    <aside className="sidebar">
    <img src={quicker} alt="Quicker Logo" className="logo" />
      <ul className="menu">
        <li className="menu-item" onClick={() => navigate('/emergency')}>Emergency Room</li>
        <li className="menu-item" onClick={() => navigate('/inventory')}>Inventory</li>
        <li className="menu-item active" onClick={() => navigate('/bedmanagement')}>Bed Management</li>
        <li className="menu-item" onClick={() => navigate('/billing')}>Billing</li>
        <li className="menu-item" onClick={() => setShowModal(true)}>Log-out</li>
      </ul>

      {/* Log-out Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Log-out</h2>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              
              <button onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleLogout} className="btn-confirm">Yes</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  </div>
);
}

// App Component (Main Entry Point)
const App = () => {
  const [beds, setBeds] = useState([]);

  const addBed = (newBed) => {
    setBeds((prevBeds) => [...prevBeds, newBed]);
  };

  const updateBedStatus = (bedId, newStatus, newPatientName) => {
    setBeds((prevBeds) =>
      prevBeds.map((bed) =>
        bed.id === bedId ? { ...bed, status: newStatus, patient: newPatientName } : bed
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', position: 'relative' }}>
      <Sidebar />
      <div className="main-container">
        <BedManagement addBed={addBed} beds={beds} updateBedStatus={updateBedStatus} />
      </div>
    </div>
  );
};

export default App;
