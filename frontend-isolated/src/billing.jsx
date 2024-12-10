import React, { useEffect, useState, useRef } from 'react';
import './inventory.css'; 
import quicker from "./assets/quicker.png";
import { useNavigate } from 'react-router-dom';
import { useConfig } from './util/ConfigContext';
import { useUser } from './auth/UserContext';
import secureFetch from './auth/SecureFetch';
import Signature from '@lemonadejs/signature/dist/react';
import CheckboxGroup from './util/CheckBoxGroup';
import AdmissionInfo from './AdmissionInfo';

function Sidebar() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const { user, loading  } = useUser();
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (user || loading === false) {
      setIsUserLoaded(true);
    }
  }, [user, loading]);

  if (loading || !isUserLoaded) {
    return <div>Loading...</div>; 
  }

  const handleLogout = () => {
    setShowModal(false); // Close modal
    window.location.href = '/logout'; // Navigate to the login page
  };
// Sidebar Component
return (
  <div className="emergency-room-container">
    <aside className="sidebar">
    <img src={quicker} onClick={() => navigate('/menu')} alt="Quicker Logo" className="logo cursor-pointer" />
      <ul className="nav-menu">
        {(user.role == "ADMIN" || user.role == "STAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/emergency')}>Emergency Room</li>
        }
        {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/inventory')}>Inventory</li>
        }
        {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/beds')}>Bed Management</li>
        }        
        {(user.role == "ADMIN" || user.role == "STAFF") &&
          <li className="nav-menu-item active" onClick={() => navigate('/billing')}>Billing</li>
        }
        <li className="nav-menu-item" onClick={() => setShowModal(true)}>Log-out</li>
      </ul>

      {/* Log-out Confirmation Modal */}
      {showModal && (
        <div className="qe-modal-overlay">
          <div className="qe-modal !w-auto flex flex-col gap-4">
            <h4 className="text-2xl">Confirm Log-out</h4>
            <p>Are you sure you want to log out?</p>
            <div className="flex gap-4 justify-end">              
              <button onClick={() => setShowModal(false)} className="btn">Cancel</button>
              <button onClick={handleLogout} className="btn">Yes</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  </div>
);
}

function AdmissionsBilling ({ patientAdmissionsData, 
                              loading, 
                              FetchPatientAdmissions, 
                              setQuery, 
                              currentPage, 
                              setCurrentPage,
                              itemsPerPage,
                              // modal visibility methods
                              showBillingModal
                            }) {  

  const refreshAdmissions = () => {
    FetchPatientAdmissions(); 
  };

  const NextPage = () => {
    if (currentPage < patientAdmissionsData.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  const PreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  const Search = () => {
    setQuery(document.getElementById('searchInput').value);
    setCurrentPage(0);
  }


  return (
    <div className="inventory-container">

      <h4 className="text-2xl mb-2">Admissions Billing</h4>

      {/* Search Bar */}
      
        <div className='flex gap-4'>
          <input
            type="text"
            className="w-full "
            id="searchInput"
            placeholder="Search ER Admissions"
          />
          <button onClick={Search} className="btn btn-primary h-full !px-8">Search</button>
        </div>
      

      {/* Admissions Table */}
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>Name</th>
            <th>Bed Location</th>
            <th>Status</th>
            <th>Billing Status</th>
            <th className='!text-center'>Actions</th>
          </tr>
        </thead>
        {loading ? (
          <tbody>
            <tr>
              <td colSpan="5">Loading...</td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {patientAdmissionsData?.content?.map((item) => (
              <tr key={item.id}>
                <td className='text-black'>{item.id}</td>
                
                <td className='text-black'>{item.patientName}</td>
                <td className='text-black'>{item.patientBedLocCode}</td>
                <td className='text-black'>
                  <span className={"badge badge-solid text-nowrap " + 
                    (item.patientStatus === 'pre-admission' ? 'badge-warning'
                      : item.patientStatus === 'in-surgery' ? 'badge-error'
                      : item.patientStatus === 'admitted-ER' ? 'badge-success'
                      : item.patientStatus.includes('pending-pay') ? 'badge-accent'
                      : (item.patientStatus === 'paid' || item.patientStatus === 'collateralized') ? 'badge-info'
                      : 'badge-neutral')
                  }> {item.patientStatus} </span>

                </td>
                <td>
                  <span className={"badge badge-solid " + 
                    (item.patientBillingStatus === 'paid' ? 'badge-success'
                      : item.patientBillingStatus === 'collateralized' ? 'badge-warning'
                      : 'badge-neutral')
                  }>{item.patientBillingStatus}</span>
                </td>
                <td className='text-black flex justify-center gap-2'>
                  <button type="button" onClick={() => showBillingModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                    <span className="">Bill</span>
                  </button>
                  <button type="button" className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                    <span className="">Order</span>
                  </button>
                  <button type="button" className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                    <span className="">Discounts</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {/* Pagination Controls */}
      {
        !loading && patientAdmissionsData?.pageable ? (
          <div className="pagination-controls">
            <button 
              onClick={PreviousPage} 
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span className='text-black'>
              Page {currentPage + 1} of {patientAdmissionsData.totalPages}
            </span>
            <button 
              onClick={NextPage} 
              disabled={currentPage === patientAdmissionsData.totalPages}
            >
              Next
            </button>
          </div>
        ) : null
      }

    </div>
  );
};

function BillingModal({ admissionID, closeModal }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);

  const FetchBilling = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/patient-billing/all/${admissionID}?` + new URLSearchParams({
      page: currentPage,
      size: 5
    }).toString(), 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      setBillingData(data)
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    FetchBilling();
  }, [serverUrl, currentPage])

  return (
    <div className='qe-modal-overlay'>     
    { loading ? (
      <span>Loading...</span>
      ) : (
        <div className="qe-modal gap-4 !w-fit !max-w-fit flex">
          <div className="inventory-container">

            <div className="inventory-container">
              <h4 className="text-2xl mb-2">Inventory</h4>
              <table>
                <thead>
                  <tr>
                    <th>id</th>
                    <th>Details</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Discount</th>
                    <th>Total</th>
                    <th className='!text-center'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                      <tr>
                        <td colSpan="5">Loading...</td>
                      </tr>
                  ) : (
                    billingData?.content?.map((item) => (
                      <tr key={item.id}>
                        <td className='text-black'>{item.id}</td>
                        <td className='text-black'>{item.billingItemDetails}</td>
                        <td className='text-black'>{item.billingItemQty}</td>
                        <td className='text-black'>{item.billingItemPrice}</td>
                        <td className='text-black'>{item.billingItemDiscount}</td>
                        <td className='text-black'>{(item.billingItemQty * item.billingItemPrice) - item.billingItemDiscount}</td>
                        <td className='text-black flex justify-center'>
                          <button type="button" onClick={() => showUpdateModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                            <span className="icon-[tabler--pencil] text-neutral-500"></span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

            <button onClick={closeModal} className="btn btn-secondary">Close</button>
          </div>
        </div>
      )
    }
    </div>
  )

}

// App Component (Main Entry Point)
function App() {  
  const { serverUrl } = useConfig();
  const [patientAdmissionsData, setPatientAdmissionsData] = useState({});
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(false);

  const FetchPatientAdmissions = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/patient-admissions/search?` + new URLSearchParams({
      query: query,
      page: currentPage,
      size: itemsPerPage
    }).toString(), 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      setPatientAdmissionsData(data)
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }
  
  useEffect(() => {
    FetchPatientAdmissions();
  }, [query, currentPage, itemsPerPage, serverUrl]);
  
  // SHOW/HIDE MODAL METHODS
  const [admissionID, setAdmissionID] = useState(null);

  const [billingModalVisible, setBillingModalVisible] = useState(false);
  const showBillingModal = (id) => {
    console.log(id)
    setAdmissionID(id);
    setBillingModalVisible(true);
  }
  const closeBillingModal = () => {
    setBillingModalVisible(false);
  }
  

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', position: 'relative' }}>
      <Sidebar />
      <div className="main-container">
        <div className="content-container">
          {/* Inventory */}
          <AdmissionsBilling
            patientAdmissionsData={patientAdmissionsData}
            loading={loading}
            FetchPatientAdmissions={FetchPatientAdmissions}
            setQuery={setQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}

            showBillingModal={showBillingModal}
          />

          {billingModalVisible &&
            <BillingModal
            admissionID={admissionID}
            closeModal={closeBillingModal}
            />
          }
        </div>
      </div>
    </div>
  );
};

export default App;
