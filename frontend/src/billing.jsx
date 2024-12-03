import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./billing.css"; 
import quicker from "./assets/quicker.png"; 

const BillingPage = () => {
    const [patients, setPatients] = useState([
        ]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const [newPatient, setNewPatient] = useState({
        name: "",
        status: "",
        bed: "",
        triage: "",
        admissionDate: "",
        receipt: [],
        hmoDiscount: false, // Track HMO Discount
        philHealthDiscount: false, // Track PhilHealth Discount
    });

    const [selectedPatient, setSelectedPatient] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const patientsPerPage = 5;

    const calculateDaysStayed = (admissionDate) => {
        const currentDate = new Date();
        const admissionDateObj = new Date(admissionDate);
        const timeDifference = currentDate - admissionDateObj;
        const daysStayed = Math.floor(timeDifference / (1000 * 3600 * 24));
        return daysStayed;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPatient((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleReceiptChange = (e, itemIndex) => {
        const { name, value } = e.target;
        setNewPatient((prev) => {
            const updatedReceipt = [...prev.receipt];
            updatedReceipt[itemIndex][name] = value;
            return { ...prev, receipt: updatedReceipt };
        });
    };

    const addReceiptItem = () => {
        setNewPatient((prev) => ({
            ...prev,
            receipt: [...prev.receipt, { service: "", quantity: "", unitCost: "", totalCost: "" }]
        }));
    };

    const removeReceiptItem = (index) => {
        setNewPatient((prev) => ({
            ...prev,
            receipt: prev.receipt.filter((_, i) => i !== index)
        }));
    };

    const handleAddPatient = () => {
        setPatients((prev) => [...prev, { ...newPatient, id: Date.now() }]);
        setShowModal(false);
        setNewPatient({ name: "", status: "", bed: "", triage: "", admissionDate: "", receipt: [], hmoDiscount: false, philHealthDiscount: false });
    };

    const viewReceipt = (patient) => {
        const daysStayed = calculateDaysStayed(patient.admissionDate);
        setSelectedPatient({ ...patient, daysStayed });
    };

    const calculateTotalWithDiscount = (receipt, hmoDiscount, philHealthDiscount) => {
        const subtotal = receipt.reduce((total, item) => total + parseFloat(item.totalCost || 0), 0);
        let discount = 0;

        if (hmoDiscount) {
            discount += 0.1 * subtotal; // HMO 10% discount
        }

        if (philHealthDiscount) {
            discount += 0.05 * subtotal;
        }

        return subtotal - discount;
    };

    const filteredPatients = patients.filter((patient) => {
        return patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < Math.ceil(filteredPatients.length / patientsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
 
    const Sidebar = () => {
        const navigate = useNavigate();
        return (
          <div className="emergency-room-container">
            {/* Sidebar */}
            <aside className="sidebar">
              <img src={quicker} alt="Quicker Logo" className="logo" />
              <ul className="menu">
                <li className="menu-item" onClick={() => navigate('/emergency')}>Emergency Room</li>
                <li className="menu-item"onClick={() => navigate('/inventory')}>Inventory</li>
                <li className="menu-item active" onClick={() => navigate('/billing')}>Billing</li>
              </ul>
            </aside>
          </div>
        );
      };
    return (

        <div  style={{ display: 'flex', flexDirection: 'row', height: '100vh', position: 'relative' }}>
<Sidebar />


            <div className="content">
                <div className="patient-list-container">
                    <h2>Patient List</h2>
                    <button className="update-button" onClick={() => setShowModal(true)}>
                        + Add Patient
                    </button>

                    {/* Search Bar */}
                    
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-bar"
                        
                        />
                   

                    <div className="table-container">
                        <table className="patient-table">
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Triage</th>
                                    <th>Patient</th>
                                    <th>Bed</th>
                                    <th>Status</th>
                                   
                                </tr>
                            </thead>
                            <tbody>
                                {currentPatients.map((patient, index) => (
                                    <tr key={index}>
                                        <td>{patient.triage}</td>
                                        <td>{patient.name}</td>
                                        <td>{patient.bed}</td>
                                        <td>{patient.status}</td>
                                        <td className="actions">
                                            <button onClick={() => viewReceipt(patient)}>Details</button>
                                            <button className="print">Print</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination">
                        <button onClick={prevPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {Math.ceil(filteredPatients.length / patientsPerPage)}
                        </span>
                        <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}>
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {
                showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                            <h2>Add New Patient</h2>
                            <form>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newPatient.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter patient's name"
                                    required
                                />
                                <label>Status:</label>
                                <select
                                    name="status"
                                    value={newPatient.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="Deceased">Deceased</option>
                                    <option value="Ready for Discharge">Ready for Discharge</option>
                                    <option value="Awaiting for Discharge">Awaiting for Discharge</option>
                                    <option value="Under Observation">Under Observation</option>
                                    <option value="Waiting for Treatment">Waiting for Treatment</option>
                                </select>
                                <label>Bed:</label>
                                <input
                                    type="text"
                                    name="bed"
                                    value={newPatient.bed}
                                    onChange={handleInputChange}
                                    placeholder="Enter patient's bed"
                                />
                                <label>Triage:</label>
                                <select
                                    name="triage"
                                    value={newPatient.triage}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="L">Low</option>
                                    <option value="M">Medium</option>
                                    <option value="C">Critical</option>
                                    <option value="H">High</option>
                                    <option value="D">Deceased</option>
                                </select>
                                <label>Admission Date:</label>
                                <input
                                    type="date"
                                    name="admissionDate"
                                    value={newPatient.admissionDate}
                                    onChange={handleInputChange}
                                />

                                {/* Separate HMO and PhilHealth Discount */}
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newPatient.hmoDiscount}
                                        onChange={(e) => setNewPatient(prev => ({ ...prev, hmoDiscount: e.target.checked }))}
                                    />
                                    Apply HMO Discount (10%)
                                </label>
                                <br />
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newPatient.philHealthDiscount}
                                        onChange={(e) => setNewPatient(prev => ({ ...prev, philHealthDiscount: e.target.checked }))}
                                    />
                                    Apply PhilHealth Discount (5%)
                                </label>

                                <h3>Receipt</h3>
                                <table className="receipt-table">
                                    <thead>
                                        <tr>
                                            <th>Service</th>
                                            <th>Quantity</th>
                                            <th>Unit Cost</th>
                                            <th>Total Cost</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newPatient.receipt.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="service"
                                                        value={item.service}
                                                        onChange={(e) => handleReceiptChange(e, index)}
                                                        placeholder="Enter service"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        value={item.quantity}
                                                        onChange={(e) => handleReceiptChange(e, index)}
                                                        placeholder="Enter quantity"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="unitCost"
                                                        value={item.unitCost}
                                                        onChange={(e) => handleReceiptChange(e, index)}
                                                        placeholder="Enter unit cost"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="totalCost"
                                                        value={item.totalCost}
                                                        onChange={(e) => handleReceiptChange(e, index)}
                                                        placeholder="Enter total cost"
                                                    />
                                                </td>
                                                <td>
                                                    <button type="button" onClick={() => removeReceiptItem(index)}>Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button type="button" onClick={addReceiptItem}>Add Item</button>
                                <br />
                                <button type="button" onClick={handleAddPatient}>Add Patient</button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* View Receipt Modal */}
            {
                selectedPatient && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={() => setSelectedPatient(null)}>&times;</span>
                            <h2>City Hospital - Receipt</h2>
                            <p><strong>City Hospital</strong></p>
                            <p>123 Health Ave, Medtown, USA</p>
                            <p>Phone: (123) 456-7890</p>
                            <h2>Receipt for {selectedPatient.name}</h2>
                            <p><strong>Admission Date:</strong> {selectedPatient.admissionDate}</p>
                            <p><strong>Days Stayed:</strong> {selectedPatient.daysStayed}</p>

                            {/* Add Patient Status Here */}
                            <p><strong>Status:</strong> {selectedPatient.status}</p>

                            <table className="receipt-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Quantity</th>
                                        <th>Unit Cost</th>
                                        <th>Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPatient.receipt.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.service}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.unitCost}</td>
                                            <td>{item.totalCost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Display discount applied */}
                            <div>
                                {selectedPatient.hmoDiscount && (
                                    <p><strong>HMO Discount Applied: 10%</strong></p>
                                )}
                                {selectedPatient.philHealthDiscount && (
                                    <p><strong>PhilHealth Discount Applied: 5%</strong></p>
                                )}
                            </div>

                            <p><strong>Total Due:</strong> ₱{calculateTotalWithDiscount(selectedPatient.receipt, selectedPatient.hmoDiscount, selectedPatient.philHealthDiscount).toFixed(2)}</p>

                            <p>Thank you for choosing City Hospital. For questions, call our billing department at (123) 456-7890.</p>

                            <button onClick={() => setSelectedPatient(null)} className="close-btn">
                                Close
                            </button>

                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default BillingPage;
