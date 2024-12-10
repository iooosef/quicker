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
                              showBillingModal,
                              showOrderModal
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
                <td className='text-black flex gap-2'>
                  <button type="button" onClick={() => showBillingModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit flex-1'>
                    <span className="">Bill</span>
                  </button>
                  {isPatientOutOfER(item.patientStatus) && (
                      <button type="button" onClick={() => showOrderModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                        <span className="">Order</span>
                      </button>
                    )
                  }
                  {isPatientOutOfER(item.patientStatus) && (
                      <button type="button" className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                        <span className="">Discounts</span>
                      </button>
                    )
                  }
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
              disabled={patientAdmissionsData.totalPages === 1 || (currentPage === patientAdmissionsData.totalPages)}
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
  const [editState, setEditState] = useState({ id: null, newQty: 0 });

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

  const PageNav  = (direction) => {
    if (direction === 'next') {
      if (currentPage < billingData.totalPages - 1) {
        setCurrentPage(currentPage + 1);
      }
    } else if (direction === 'prev') {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
  }

  const handleEditQty = (id, qty, details) => {
    if (details === 'Emergency Room Fee') {
      alert("It's not possible to change the quantity for Emergency Room Fee.");
      return;
    }
  
    setEditState((prevState) =>
      prevState.id === id
        ? { id: null, newQty: 0 } // Toggle off if the same ID is clicked
        : { id, newQty: qty } // Set new edit state
    );
  };

  const handleCancelEdit = () => {
    setEditState({ id: null, newQty: 0 });
  };

  const handleUpdateQty = (id) => {
    const updatedItem = billingData.content.find((item) => item.id === id);
    if (!updatedItem || !serverUrl) return;

    const payload = {
      id: updatedItem.id,
      admissionID: updatedItem.admissionID,
      billingItemDetails: updatedItem.billingItemDetails,
      billingItemQty: editState.newQty,
      billingItemPrice: updatedItem.billingItemPrice,
      billingItemDiscount: updatedItem.billingItemDiscount
    }

    secureFetch(`${serverUrl}/patient-billing/billing/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          alert("Item updated successfully");
        }
        FetchBilling();
        setEditState({ id: null, newQty: 0 });
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className='qe-modal-overlay'>     
    { loading ? (
      <span>Loading...</span>
      ) : (
        <div className="qe-modal gap-4 !w-fit !max-w-fit flex">

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
                        <td className='text-black'>
                        {editState.id === item.id ? (
                          <>
                            <input type="number" className="border rounded px-2 w-16" min="0"
                              value={editState.newQty}
                              onChange={(e) =>
                                setEditState((prev) => ({
                                  ...prev,
                                  newQty: e.target.value,
                                }))
                              }
                            />
                            <button onClick={() => handleUpdateQty(item.id)} className="btn btn-soft btn-primary mx-1" >
                              Update
                            </button>
                            <button onClick={handleCancelEdit} className="btn btn-soft btn-secondary">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {item.billingItemQty}
                          </>
                        )}
                        </td>
                        <td className='text-black'>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.billingItemPrice ?? 0)}</td>
                        <td className='text-black'>{item.billingItemDiscount}</td>
                        <td className='text-black'>{
                          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' })
                          .format(((item.billingItemQty ?? 0) * (item.billingItemPrice ?? 0)) - (item.billingItemDiscount ?? 0))                        
                        }</td>
                        <td className='text-black flex justify-center'>
                          <button type="button" onClick={() => handleEditQty(item.id, item.billingItemQty, item.billingItemDetails)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                            <span className="icon-[tabler--pencil] text-neutral-500"></span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>

              {
                !loading && billingData?.pageable ? (
                  <div className="pagination-controls">
                    <button 
                      onClick={() => PageNav('prev')} 
                      disabled={currentPage === 0}
                    >
                      Previous
                    </button>
                    <span className='text-black'>
                      Page {currentPage + 1} of {billingData.totalPages}
                    </span>
                    <button 
                      onClick={() => PageNav('next')} 
                      disabled={billingData.totalPages === 1 || (currentPage === billingData.totalPages)}
                    >
                      Next
                    </button>
                  </div>
                ) : null
              }
            </div>

            <button onClick={closeModal} className="btn btn-secondary">Close</button>
        </div>
      )
    }
    </div>
  );
}

function OrderModal({ admissionID, closeModal }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [treatments, setTreatments] = useState({});
  const [tests, setTests] = useState({});
  const [supplies, setSupplies] = useState({});

  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [selectedSupply, setSelectedSupply] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [treatmentQuantity, setTreatmentQuantity] = useState(1);
  const [supplyQuantity, setSupplyQuantity] = useState(1);
  const [testQuantity, setTestQuantity] = useState(1);

  const FetchSupplies = async (type) => {
    if (!serverUrl) return;
    setLoading(true)
    try {
      const response = await secureFetch(`${serverUrl}/supplies/search?` + new URLSearchParams({
        query: type,
        page: currentPage,
        size: 100
      }).toString(), 
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  const setAllTreatments = async () => {
    const result = await FetchSupplies('treatment:');
    setTreatments(result);
  }

  const setAllTests = async () => {
    const result = await FetchSupplies('test:');
    setTests(result);
  }

  const setAllSupplies = async () => {
    const result = await FetchSupplies('supply:');
    setSupplies(result);
  }

  useEffect(() => {
    setIsLoaded(false);
    const fetchData = async () => {
      try {
        await Promise.all([setAllTreatments(), setAllTests(), setAllSupplies()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoaded(true);
      }
    };   
    fetchData();
  }, []);

  const OrderBilling = async (type) => {
    if (!serverUrl) return;
    const item = type === 'treatment' ? selectedTreatment : type === 'supply' ? selectedSupply : selectedTest;
    const quantity = type === 'treatment' ? treatmentQuantity : type === 'supply' ? supplyQuantity : testQuantity;

    if (!item || quantity < 1) return;
    try {
      setLoading(true);
      const response = await secureFetch(`${serverUrl}/patient-billing/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          admissionID,
          billingItemDetails: item,
          billingItemPrice: 1, // to be changed server-side
          billingItemQty: quantity,
          billingItemDiscount: 0 // to be changed server-side,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} Order Added`);
      } else {
        alert(`Failed to add ${type} order`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='qe-modal-overlay'>     
    { loading ? (
      <span>Loading...</span>
      ) : (
        <div className="qe-modal gap-4 !w-fit !max-w-fit flex flex-col">
            <h4 className="text-2xl mb-2">Add Orders for Admission No. {admissionID}</h4>
            {/* Treatment Orders */}
            <div className="inventory-container gap-4">
              <h4 className="text-2xl mb-2">Treatment Orders</h4>
              <div className='flex gap-4'>

                <div className="relative w-full">
                  <select className="select select-floating max-w-sm" 
                  onChange={(e) => setSelectedTreatment(e.target.value)}>
                    <option value=''>Select Treatment</option>
                    { isLoaded && 
                      treatments?.content.map((item) => (
                        <option key={item.id} value={item.id}>{item.supplyName}</option>
                      ))}
                  </select>
                  <span className="select-floating-label">Treatment</span>
                </div>
                <div className="form-control">
                  <input type="number" placeholder="" className="input input-floating peer" defaultValue="1" min="1"
                  onChange={(e) => setTreatmentQuantity(Number(e.target.value))} />
                  <label className="input-floating-label">Quantity</label>
                </div>
              </div>
              <button onClick={() => OrderBilling('treatment')} className="btn btn-primary">Order Treatment</button>
            </div>

            {/* Test Orders */}
            <div className="inventory-container gap-4">
              <h4 className="text-2xl mb-2">Test Orders</h4>
              <div className='flex gap-4'>

                <div className="relative w-full">
                  <select className="select select-floating max-w-sm" 
                  onChange={(e) => setSelectedSupply(e.target.value)}>
                    <option value=''>Select Test</option>
                    { isLoaded && 
                      tests?.content?.map((item) => (
                        <option key={item.id} value={item.id}>{item.supplyName}</option>
                      ))}
                  </select>
                  <span className="select-floating-label">Test</span>
                </div>
                <div className="form-control">
                  <input type="number" placeholder="" className="input input-floating peer" defaultValue="1" min="1"
                  onChange={(e) => setSupplyQuantity(Number(e.target.value))} />
                  <label className="input-floating-label">Quantity</label>
                </div>
              </div>
              <button onClick={() => OrderBilling('supply')} className="btn btn-primary">Order Test</button>
            </div>


            {/* Supply Orders */}
            <div className="inventory-container gap-4">
              <h4 className="text-2xl mb-2">Supply Orders</h4>
              <div className='flex gap-4'>

                <div className="relative w-full">
                  <select className="select select-floating max-w-sm" 
                  onChange={(e) => setSelectedSupply(e.target.value)}>
                    <option value=''>Select Supply</option>
                    { isLoaded && 
                      supplies?.content?.map((item) => (
                        <option key={item.id} value={item.id}>{item.supplyName}</option>
                      ))}
                  </select>
                  <span className="select-floating-label">Supply</span>
                </div>
                <div className="form-control">
                  <input type="number" placeholder="" className="input input-floating peer" defaultValue="1" min="1"
                  onChange={(e) => setSupplyQuantity(Number(e.target.value))} />
                  <label className="input-floating-label">Quantity</label>
                </div>
              </div>
              <button onClick={() => OrderBilling('supply')} className="btn btn-primary">Order Supply</button>
            </div>

            <button onClick={closeModal} className="btn btn-secondary">Close</button>
        </div>
      )
    }
    </div>
  )
  
}

const isPatientOutOfER = (status) => {
  return status === "paid" || status === "collateralized" || 
         status === "discharged" || status === "admitted-to-ward" || status?.includes("transferred");
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

  const[orderModalVisible, setOrderModalVisible] = useState(false);
  const showOrderModal = (id) => {
    console.log(id)
    setAdmissionID(id);
    setOrderModalVisible(true);
  }
  const closeOrderModal = () => {
    setOrderModalVisible(false);
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
            showOrderModal={showOrderModal}
          />

          {billingModalVisible &&
            <BillingModal
            admissionID={admissionID}
            closeModal={closeBillingModal}
            />
          }

          {orderModalVisible &&
            <OrderModal
            admissionID={admissionID}
            closeModal={closeOrderModal}
            />
          }
        </div>
      </div>
    </div>
  );
};

export default App;
