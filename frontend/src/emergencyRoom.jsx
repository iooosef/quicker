import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./emergencyRoom.css";
import quicker from "./assets/quicker.png";

const EmergencyRoom = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [nextPatientID, setNextPatientID] = useState(0); // Start from 0
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [treatmentsOrdered, setTreatmentsOrdered] = useState(""); // Temporary input for new treatment
  const [patientLogs, setPatientLogs] = useState([]); // Logs for all updates and treatments
  const [formMode, setFormMode] = useState("PatientDetails"); // Default to "Patient Details"

  

  const [newPatient, setNewPatient] = useState({
    name: "",
    triage: "C",
    bed: "Bed 01",
  });

  const [statusUpdate, setStatusUpdate] = useState("");

  const [patientDetails, setPatientDetails] = useState({
    patientID: "",
    fullName: "",
    dob: "",
    address: "",
    contactNumber: "",
    sex: "Male",
    emergencyContactName: "",
    emergencyContactNumber: "",
    pwdID: "",
    seniorCitizenID: "",
  });

  // Add Patient Modal Handlers
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setNewPatient({ name: "", triage: "C", bed: "Bed 01" });
    setShowAddModal(false);
  };

  const handleAddTreatment = () => {
    if (!treatmentsOrdered.trim()) return;
  
    const updatedPatients = [...patients];
    const patient = updatedPatients[selectedPatientIndex];
  
    // Add treatment
    patient.treatments = patient.treatments || [];
    patient.treatments.push(treatmentsOrdered);
  
    // Add log entry
    patient.logs = patient.logs || [];
    patient.logs.push({
      time: new Date().toLocaleString(),
      action: `Treatment ordered: ₱{treatmentsOrdered}`,
    });
  
    setPatients(updatedPatients);
    setTreatmentsOrdered(""); // Clear input
  };


  

  const handleAddPatient = () => {
    setPatients([
      ...patients,
      {
        id: `P-${nextPatientID}`,
        ...newPatient,
        status: "Waiting for Assessment",
        lastUpdated: new Date().toLocaleString(),
        treatments: [],
        logs: [
          {
            time: new Date().toLocaleString(),
            action: "Patient added",
          },
        ],
        details: {
          fullName: newPatient.name,
          dob: "",
          address: "",
          contactNumber: "",
          sex: "Male",
          emergencyContactName: "",
          emergencyContactNumber: "",
          pwdID: "",
          seniorCitizenID: "",
        },
      }
      
    ]);
    setNextPatientID(nextPatientID + 1); // Increment ID for next patient
    closeAddModal();
  };
  

  // Update Status Modal Handlers
  const openUpdateModal = (index) => {
    setSelectedPatientIndex(index);
    setShowUpdateModal(true);
  };
  const closeUpdateModal = () => {
    setSelectedPatientIndex(null);
    setShowUpdateModal(false);
  };

  const handleStatusUpdate = () => {
    const updatedPatients = [...patients];
    const patient = updatedPatients[selectedPatientIndex];
  
    // Update status
    patient.status = statusUpdate;
    patient.lastUpdated = new Date().toLocaleString();
  
    // Add log entry
    patient.logs = patient.logs || [];
    patient.logs.push({
      time: new Date().toLocaleString(),
      action: `Status updated to: ${statusUpdate}`,
    });
  
    setPatients(updatedPatients);
    closeUpdateModal();
  };
  

  // Open Details Modal
  const openDetailsModal = (index) => {
    setSelectedPatientIndex(index);
    setPatientDetails(patients[index].details); // Load patient-specific details
    setShowDetailsModal(true);
  };
  

  const closeDetailsModal = () => setShowDetailsModal(false);

  const handleSaveDetails = () => {
    const updatedPatients = [...patients];
    const selectedPatient = updatedPatients[selectedPatientIndex];
  
    // Sync changes made in the modal back to the patients array
    selectedPatient.details = { ...patientDetails };
    selectedPatient.name = patientDetails.fullName; // Update the name in the table
    
    setPatients(updatedPatients);
    closeDetailsModal();
  };
  
  

  // Filter Patients by Search Term
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="emergency-room-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <img src={quicker} alt="Quicker Logo" className="logo" />
        <ul className="menu">
          <li className="menu-item active" onClick={() => navigate('/emergency')}>Emergency Room</li>
          <li className="menu-item" onClick={() => navigate('/inventory')}>Inventory</li>
          <li className="menu-item"onClick={() => navigate('/billing')}>Billing</li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="emergency-room-content">
        <header className="header">
          <h1>Emergency Room</h1>
        </header>

        <div className="controls">
          <button className="update-button" onClick={openAddModal}>
            + Add Patient
          </button>
          <input
            type="text"
            className="search-bar"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="patients-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Triage</th>
              <th>Patient</th>
              <th>Bed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={index}>
                <td>{patient.id}</td>
                <td className={`triage-${patient.triage.toLowerCase()}`}>{patient.triage}</td>
                <td>{patient.name}</td>
                <td>{patient.bed}</td>
                <td>
                  {patient.status} <br />
                  <small>{patient.lastUpdated ? `Updated: ${patient.lastUpdated}` : ""}</small>
                </td>
                <td>
                  <button onClick={() => openDetailsModal(index)} className="smaller-update-button">Details</button>
                  <button onClick={() => openUpdateModal(index)} className="smaller-update-button">Update</button>
                  <button onClick={() => setPatients(patients.filter((_, i) => i !== index))} className="smaller-update-button">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Patient</h2>
            <label>Name: <input type="text" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} /></label>
            <label>Triage:
              <select value={newPatient.triage} onChange={(e) => setNewPatient({ ...newPatient, triage: e.target.value })}>
                <option value="C">Critical</option>
                <option value="H">High</option>
                <option value="M">Moderate</option>
                <option value="L">Low</option>
              </select>
            </label>
            <label>Bed:
              <select value={newPatient.bed} onChange={(e) => setNewPatient({ ...newPatient, bed: e.target.value })}>
                <option value="Bed 01">Bed 01</option>
                <option value="Bed 02">Bed 02</option>
                <option value="Bed 03">Bed 03</option>
              </select>
            </label>
            <div className="form-actions">
              <button onClick={closeAddModal}>Cancel</button>
              <button onClick={handleAddPatient}>Add Patient</button>
            </div>
          </div>
        </div>
      )}


     {/* Update Status Modal */}
{showUpdateModal && (
  <div className="modal-overlay" onClick={closeUpdateModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>Update Patient</h2>

      {/* Update Status Section */}
      <label>
        Status:
        <select
          value={statusUpdate}
          onChange={(e) => setStatusUpdate(e.target.value)}
        >
          <option value="Waiting for Assessment">Waiting for Assessment</option>
          <option value="In Treatment">In Treatment</option>
          <option value="Under Observation">Under Observation</option>
          <option value="Pending Test Results">Pending Test Results</option>
          <option value="Ready for Discharge">Ready for Discharge</option>
          <option value="Deceased">Deceased</option>
        </select>
      </label>
      <button onClick={handleStatusUpdate} className="smaller-update-button">
        Update Status
      </button>

      {/* Update/View Treatments Section */}
      <h3>Treatments Ordered</h3>
      <div className="treatments-section">
        <input
          type="text"
          placeholder="Enter treatment"
          value={treatmentsOrdered}
          onChange={(e) => setTreatmentsOrdered(e.target.value)}
        />
        <button
          onClick={handleAddTreatment}
          className="smaller-update-button"
        >
          Add Treatment
        </button>
      </div>
      <ul>
        {patients[selectedPatientIndex]?.treatments?.map((treatment, idx) => (
          <li key={idx}>{treatment}</li>
        ))}
      </ul>

      {/* Patient Logs Section */}
      <h3>Patient Logs</h3>
      <ul>
        {patients[selectedPatientIndex]?.logs?.map((log, idx) => (
          <li key={idx}>
            <strong>{log.time}</strong>: {log.action}
          </li>
        ))}
      </ul>

      <button onClick={closeUpdateModal} className="smaller-update-button">
        Close
      </button>
    </div>
  </div>
)}


      {/* Patient Details Modal */}
     {/* Patient Details Modal */}
{showDetailsModal && (
  <div className="modal-overlay" onClick={closeDetailsModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>
        {formMode === "PatientDetails"
          ? "Patient Information"
          : formMode === "PhilHealthForm"
          ? "PhilHealth Form"
          : "HMO Details"}
      </h2>

      {/* Shared Fields */}
      <label>
        Full Name:
        <input
          type="text"
          value={patientDetails.fullName}
          onChange={(e) =>
            setPatientDetails({ ...patientDetails, fullName: e.target.value })
          }
        />
      </label>
      <label>
        Date of Birth:
        <input
          type="date"
          value={patientDetails.dob}
          onChange={(e) =>
            setPatientDetails({ ...patientDetails, dob: e.target.value })
          }
        />
      </label>
      <label>
        Address:
        <input
          type="text"
          value={patientDetails.address}
          onChange={(e) =>
            setPatientDetails({ ...patientDetails, address: e.target.value })
          }
        />
      </label>
      <label>
        Contact Number:
        <input
          type="text"
          value={patientDetails.contactNumber}
          onChange={(e) =>
            setPatientDetails({
              ...patientDetails,
              contactNumber: e.target.value,
            })
          }
        />
      </label>

      {/* Mode-Specific Fields */}
      {formMode === "PhilHealthForm" && (
        <>
          <label>
            Height:
            <input
              type="text"
              value={patientDetails.height || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  height: e.target.value,
                })
              }
            />
          </label>
          <label>
            Weight:
            <input
              type="text"
              value={patientDetails.weight || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  weight: e.target.value,
                })
              }
            />
          </label>
          <label>
            Allergies:
            <input
              type="text"
              value={patientDetails.allergies || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  allergies: e.target.value,
                })
              }
            />
          </label>
          <label>
            Comorbidity:
            <input
              type="text"
              value={patientDetails.comorbidity || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  comorbidity: e.target.value,
                })
              }
            />
          </label>
          <label>
            Surgeries/Hospitalization History:
            <input
              type="text"
              value={patientDetails.surgeriesHistory || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  surgeriesHistory: e.target.value,
                })
              }
            />
          </label>
          <label>
            COVID Vaccine:
            <select
              value={patientDetails.covidVaccine || "No"}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  covidVaccine: e.target.value,
                })
              }
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
        </>
      )}

      {formMode === "HMO" && (
        <>
          <label>
            HMO Provider:
            <input
              type="text"
              value={patientDetails.hmoProvider || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  hmoProvider: e.target.value,
                })
              }
            />
          </label>
          <label>
            HMO ID:
            <input
              type="text"
              value={patientDetails.hmoId || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  hmoId: e.target.value,
                })
              }
            />
          </label>
          <label>
            HMO Account Owner Name:
            <input
              type="text"
              value={patientDetails.hmoOwner || ""}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  hmoOwner: e.target.value,
                })
              }
            />
          </label>
        </>
      )}

      {/* Footer Buttons */}
      <div className="form-actions">
        <button
          onClick={() => setFormMode("PatientDetails")}
          className={`smaller-update-button ${
            formMode === "PatientDetails" ? "active" : ""
          }`}
        >
          Patient Details
        </button>
        <button
          onClick={() => setFormMode("PhilHealthForm")}
          className={`smaller-update-button ${
            formMode === "PhilHealthForm" ? "active" : ""
          }`}
        >
          PhilHealth Form
        </button>
        <button
          onClick={() => setFormMode("HMO")}
          className={`smaller-update-button ${
            formMode === "HMO" ? "active" : ""
          }`}
        >
          HMO
        </button>
        <button className="smaller-update-button">Print</button>
        <button onClick={closeDetailsModal} className="smaller-update-button">
          Cancel
        </button>
        <button onClick={handleSaveDetails} className="smaller-update-button">
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default EmergencyRoom;
