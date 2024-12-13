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
import { use } from 'react';

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
                              showOrderModal,
                              showDiscountModal
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
                  <button type="button" onClick={() => showBillingModal(item.id, item.patientStatus)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit flex-1'>
                    <span className="">Bill</span>
                  </button>
                  {!isPatientOutOfER(item.patientStatus) && (
                      <button type="button" onClick={() => showOrderModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                        <span className="">Order</span>
                      </button>
                    )
                  }
                  {!isPatientOutOfER(item.patientStatus) && (
                      <button type="button" onClick={() => showDiscountModal(item.id, item.patientStatus)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
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

function BillingModal({ admissionID, closeModal, editable }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [editState, setEditState] = useState({ id: null, newQty: 0 });
  const [total, setTotal] = useState(0);

  const FetchBilling = () => {
    if (!serverUrl) return;
    setLoading(true)
    setTotal(0);
    secureFetch(`${serverUrl}/patient-billing/all/${admissionID}?` + new URLSearchParams({
      page: currentPage,
      size: 5
    }).toString(), 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => {
      if (response.ok) {
        solveTotal();
        return response.json();        
      }
      throw new Error('Failed to fetch billing data');
    })
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

  const solveTotal = () => {
    let currentTotal = 0;
    billingData?.content?.forEach(element => {
      currentTotal += (element.billingItemQty * element.billingItemPrice) - element.billingItemDiscount;
    });
    setTotal(currentTotal);
    console.log(`Total: ${currentTotal}`);
  }

  useEffect(() => {
    solveTotal();
  }, [billingData])

  return (
    <div className='qe-modal-overlay'>     
    { loading ? (
      <span>Loading...</span>
      ) : (
        <div className="qe-modal gap-4 !w-fit !max-w-fit flex">

            <div className="inventory-container">
            <h4 className="text-2xl mb-2">Billing for Admission No. {admissionID}</h4>
              <table>
                <thead>
                  <tr>
                    <th>id</th>
                    <th>Details</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Discount</th>
                    <th>Total</th>
                    {!editable && (<th>Actions</th>)}
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
                        {
                          !editable && (
                            <td className='text-black flex justify-center'>
                              <button type="button" onClick={() => handleEditQty(item.id, item.billingItemQty, item.billingItemDetails)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                                <span className="icon-[tabler--pencil] text-neutral-500"></span>
                              </button>
                            </td>
                          )
                        }
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
            {!loading && (
              <div className="stats">
              <div className="stat">
                <div className="stat-title">Total Cost </div>
                <div className="stat-value">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(total ?? 0)}</div>
              </div>
            </div>
            )}

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

function DiscountModal ({admissionID, closeModal, status}) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pHealth, setPHealth] = useState({
    philHealthIDNum: '',
    philHealthEmployer: '',
  });
  const [pHealthFound, setPHealthFound] = useState(false);
  const [hmo, setHMO] = useState({
    HMOIDNum: '',
    HMOEmployer: '',
  });
  const [hmoFound, setHMOFound] = useState(false);
  
  const FetchPHealth = () => {
    if (!serverUrl) return;
    setLoading(true)
    setPHealthFound(false);
    secureFetch(`${serverUrl}/patients-philhealth/${admissionID}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => {
      if (response.status == 404) {
        setPHealthFound(false);
      }
      if (response.ok) {
        setPHealthFound(true);
        return response.json();
      }
    })
    .then(data => {
      if(!data) return;
      setPHealth(data)
    })
    .catch(error => {
      console.error(error);
      setPHealthFound(false);
    }).
    finally(() => {
      setLoading(false)
    })
  }
  
  const FetchHMO = () => {
    if (!serverUrl) return;
    setLoading(true)
    setPHealthFound(false);
    secureFetch(`${serverUrl}/patients-hmo/${admissionID}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => {
      if (response.status == 404) {
        setHMOFound(false);
      }
      if (response.ok) {
        setHMOFound(true);
        return response.json();
      }
    })
    .then(data => {
      console.log(data)
      if(!data) return;
      setHMO(data)
    })
    .catch(error => {
      console.error(error);
      setHMOFound(false);
    }).
    finally(() => {
      setLoading(false)
    })
  }
  
  const signatureRefA = useRef(null);
  const resetA = function () {
    signatureRefA.current.value = [];
  };
  
  const signatureRefB = useRef(null);
  const resetB = function () {
    signatureRefB.current.value = [];
  };

  useEffect(() => {
    FetchPHealth();
    FetchHMO();
  }
  , [])

  

  const validateModel = (type, model) => {
    const foundErrors = type == 'pHealth' ? validatePHealth(model) : validateHMO(model);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const AddPhilHealth = (e) => {
    e.preventDefault();
    if (!serverUrl) return;
    if (!validateModel('pHealth', pHealth)) return;
    setLoading(true);
    
    const now = new Date().toISOString();

    const payload = {
      admissionID: admissionID,
      philHealthIDNum: pHealth.philHealthIDNum,
      philHealthEmployer: pHealth.philHealthEmployer,
      philHealthSignature: signatureRefA.current.getImage().replace("data:image/png;base64,", ""),
      philHealthRequestOn: now,
      philHealthStatus: 'pending'
    }

    secureFetch(`${serverUrl}/patients-philhealth/patient`, 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      .then(async (response) => {
        const responseBody = await response.json()
        if(response.status !== 200) {
          console.log(responseBody);
          const errorString = responseBody.map((error) => error.message).join('\n');
          alert(errorString);
        } else {
          alert(`Successfully added a request for PhilHealth Discount for Admission No. ${admissionID}`);
          closeModal();
        }
      })
      .catch(error => console.error(error)).
      finally(() => {
        setLoading(false)
      });
  }

  const AddHMO = (e) => {
    e.preventDefault();
    if (!serverUrl) return;
    if (!validateModel(' notpHealth', hmo)) return;
    setLoading(true);
    
    const now = new Date().toISOString();

    console.log(hmo)
    const payloadH = {
      admissionID: admissionID,
      hMOIDNum: hmo.HMOIDNum,
      hMOEmployer: hmo.HMOEmployer,
      hMOSignature: signatureRefB.current.getImage().replace("data:image/png;base64,", ""),
      hMORequestOn: now,
      hMOStatus: 'pending'
    }
    console.log(payloadH)

    secureFetch(`${serverUrl}/patients-hmo/patient`, 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payloadH)
      })
      .then(async (response) => {
        const responseBody = await response.json()
        if(response.status !== 200) {
          console.log(responseBody);
          const errorString = responseBody.map((error) => error.message).join('\n');
          alert(errorString);
        } else {
          alert(`Successfully added a request for HMO Discount for Admission No. ${admissionID}`);
          closeModal();
        }
      })
      .catch(error => console.error(error)).
      finally(() => {
        setLoading(false)
      });
  }
  

  return (
    <>           
      <div className='qe-modal-overlay'>     
          { loading ? (
          <span>Loading...</span>
          ) : (
              <div className="qe-modal gap-4 !w-full !max-w-full flex">
                  <h4 className="text-2xl mb-2">Discount Info for No. {admissionID}</h4>
                  <div className='flex gap-4'>
                    
                    {/* PhilHealth SECTION */}
                    <div className='flex-1 flex flex-col gap-4'>
                      <div className="inventory-container gap-4">
                        { pHealthFound ? (
                            <>
                            <h4 className="text-2xl mb-2">PhilHealth Details</h4>
                              <div className='flex gap-4'>
                                <div className="form-control w-1/2">
                                    <input type="text" defaultValue={pHealth.id} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">ID</label>
                                </div>
                              </div>
                                <div className="form-control w-full">
                                    <input type="text" defaultValue={pHealth.philHealthIDNum} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">ID Number</label>
                                </div>
                                <div className="form-control w-full">
                                    <input type="text" defaultValue={pHealth.philHealthEmployer} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">Employer</label>
                                </div>
                              <div className='flex gap-4'>
                                <div className="form-control w-1/2">
                                    <input type="text" defaultValue={formatDTStr(pHealth.philHealthRequestOn)} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">Requested On</label>
                                </div>
                                <div className="form-control w-1/2">
                                    <input type="text" defaultValue={pHealth.philHealthStatus} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">Status</label>
                                </div>
                              </div>
                            </>
                        ) : (
                          <form onSubmit={AddPhilHealth}>
                            <div className='flex flex-col gap-4'>
                              <h4 className="text-2xl mb-2 text-nowrap">Philhealth Request Form</h4>
                              <div>
                                <h5 className="text-base-content/90 text-lg font-semibold">Philhealth Legalese Placeholder Here</h5>
                                <p className="text-base-content/80 text-base">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras congue nunc a dui porttitor, at dapibus lorem gravida. Aenean vestibulum nulla et nisl semper, sed ultricies ligula volutpat. Donec non dolor vel magna blandit tincidunt eget luctus quam. Duis ut placerat lorem. Praesent sagittis ipsum arcu, sed varius turpis tempor in. Mauris tellus arcu, egestas ut volutpat sit amet, mollis porttitor nibh. Pellentesque nec mauris dolor. Integer et placerat mi. Etiam tempus, enim in dapibus pellentesque, lectus tellus aliquam lacus, ut maximus felis ipsum vel eros. Nulla posuere imperdiet odio, nec fringilla magna. Sed rutrum, mi nec mollis ullamcorper, lorem tellus ultrices quam, sed dictum dui est vel dolor.
                                </p>
                              </div>

                                <label>                                  
                                  <div className="form-control input-group w-full max-w-full">
                                    <span className="input-group-text font-bold uppercase text-nowrap">ID Number</span>
                                    <input type="text" className={"input grow !text-black " +
                                      (errors.philHealthIDNum && 'is-invalid')
                                    }
                                    onChange={(e) => setPHealth((prev) => ({
                                      ...prev,
                                      philHealthIDNum: e.target.value
                                    }))} />
                                  </div>
                                  <div className="label">
                                    {errors.philHealthIDNum && (
                                      <span className="label-text-alt text-error">{errors.philHealthIDNum}</span>
                                    )}
                                  </div>
                                </label>
                              
                                <label>                                  
                                  <div className="form-control input-group w-full max-w-full">
                                    <span className="input-group-text font-bold uppercase text-nowrap">Employer</span>
                                    <input type="text" className={"input grow !text-black " +
                                      (errors.philHealthEmployer && 'is-invalid')
                                    }
                                    onChange={(e) => setPHealth((prev) => ({
                                      ...prev,
                                      philHealthEmployer: e.target.value
                                    }))} />
                                  </div>
                                  <div className="label">
                                    {errors.philHealthEmployer && (
                                      <span className="label-text-alt text-error">{errors.philHealthEmployer}</span>
                                    )}
                                  </div>
                                </label>
                                
                                <div className='signature-area p-4 flex flex-col gap-4 justify-center bg-gray-300 rounded-lg'>
                    
                                  <h4 className='text-xl font-bold'>Signature Pad</h4>
                                  <Signature
                                      ref={signatureRefA}
                                      value={[]}
                                      width={420}
                                      height={120}
                                      instructions={"Please sign in the box above"}
                                  />
                                  <div className='flex gap-4'>
                                    <button type="button" onClick={resetA} className="btn btn-secondary">Clear Signature Pad</button>
                                  </div>
                                </div>
                              <button type='submit' className="btn btn-primary">Request PhilHealth Discount</button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                    {/* HMO SECTION */}
                    <div className='flex-1 flex flex-col gap-4'>
                      <div className="inventory-container gap-4">
                        { hmoFound ? (
                            <>
                            <h4 className="text-2xl mb-2">HMO Details</h4>
                              <div className='flex gap-4'>
                                <div className="form-control w-1/2">
                                    <input type="text" defaultValue={hmo.id} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">ID</label>
                                </div>
                              </div>
                                <div className="form-control w-full">
                                    <input type="text" defaultValue={hmo.hMOIDNum} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">ID Number</label>
                                </div>
                                <div className="form-control w-full">
                                    <input type="text" defaultValue={hmo.hMOEmployer} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">Employer</label>
                                </div>
                              <div className='flex gap-4'>
                                <div className="form-control w-1/2">
                                    <input type="text" defaultValue={formatDTStr(hmo.hMORequestOn)} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">Requested On</label>
                                </div>
                                <div className="form-control w-1/2">
                                    <input type="text" defaultValue={hmo.hMOStatus} className="input input-floating peer" readOnly />
                                    <label className="input-floating-label">Status</label>
                                </div>
                              </div>
                            </>
                        ) : (
                          <form onSubmit={AddHMO}>
                            <div className='flex flex-col gap-4'>
                              <h4 className="text-2xl mb-2 text-nowrap">HMO Request Form</h4>
                              <div>
                                <h5 className="text-base-content/90 text-lg font-semibold">HMO Legalese Placeholder Here</h5>
                                <p className="text-base-content/80 text-base">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras congue nunc a dui porttitor, at dapibus lorem gravida. Aenean vestibulum nulla et nisl semper, sed ultricies ligula volutpat. Donec non dolor vel magna blandit tincidunt eget luctus quam. Duis ut placerat lorem. Praesent sagittis ipsum arcu, sed varius turpis tempor in. Mauris tellus arcu, egestas ut volutpat sit amet, mollis porttitor nibh. Pellentesque nec mauris dolor. Integer et placerat mi. Etiam tempus, enim in dapibus pellentesque, lectus tellus aliquam lacus, ut maximus felis ipsum vel eros. Nulla posuere imperdiet odio, nec fringilla magna. Sed rutrum, mi nec mollis ullamcorper, lorem tellus ultrices quam, sed dictum dui est vel dolor.
                                </p>
                              </div>

                                <label>                                  
                                  <div className="form-control input-group w-full max-w-full">
                                    <span className="input-group-text font-bold uppercase text-nowrap">ID Number</span>
                                    <input type="text" className={"input grow !text-black " +
                                      (errors.HMOIDNum && 'is-invalid')
                                    }
                                    onChange={(e) => setHMO((prev) => ({
                                      ...prev,
                                      HMOIDNum: e.target.value
                                    }))} />
                                  </div>
                                  <div className="label">
                                    {errors.HMOIDNum && (
                                      <span className="label-text-alt text-error">{errors.HMOIDNum}</span>
                                    )}
                                  </div>
                                </label>
                              
                                <label>                                  
                                  <div className="form-control input-group w-full max-w-full">
                                    <span className="input-group-text font-bold uppercase text-nowrap">Employer</span>
                                    <input type="text" className={"input grow !text-black " +
                                      (errors.HMOEmployer && 'is-invalid')
                                    }
                                    onChange={(e) => setHMO((prev) => ({
                                      ...prev,
                                      HMOEmployer: e.target.value
                                    }))} />
                                  </div>
                                  <div className="label">
                                    {errors.HMOEmployer && (
                                      <span className="label-text-alt text-error">{errors.HMOEmployer}</span>
                                    )}
                                  </div>
                                </label>
                                
                                <div className='signature-area p-4 flex flex-col gap-4 justify-center bg-gray-300 rounded-lg'>
                    
                                  <h4 className='text-xl font-bold'>Signature Pad</h4>
                                  <Signature
                                      ref={signatureRefB}
                                      value={[]}
                                      width={420}
                                      height={120}
                                      instructions={"Please sign in the box above"}
                                  />
                                  <div className='flex gap-4'>
                                    <button type="button"  onClick={resetB} className="btn btn-secondary">Clear Signature Pad</button>
                                  </div>
                                </div>
                              <button type='submit' className="btn btn-primary">Request HMO Discount</button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                    
                  </div>
                  <button onClick={closeModal} className="btn btn-secondary">Close</button>
              </div>
          )}
      </div>
    </>
  )
}

const validatePHealth = (pHealth) => {
  const foundErrors = {};
  if (!pHealth.philHealthIDNum) {
    foundErrors.philHealthIDNum = 'Please enter a valid PhilHealth ID Number';
  }
  if (!pHealth.philHealthEmployer) {
    foundErrors.philHealthEmployer = 'Please enter a valid Employer';
  }
  return foundErrors;
}

const validateHMO = (hmo) => {
  const foundErrors = {};
  if (!hmo.HMOIDNum) {
    foundErrors.HMOIDNum = 'Please enter a valid HMO ID Number';
  }
  if (!hmo.HMOEmployer) {
    foundErrors.HMOEmployer = 'Please enter a valid Employer';
  }
  return foundErrors;
}

const formatDTStr = (dateStr) => {
    if (dateStr === null || isNaN(new Date(dateStr).getTime())) return '';
    const date = new Date(dateStr);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short', // Shortened version of the month (e.g., "Dec")
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // 12-hour format; set to false for 24-hour format
    }).format(date);
    return formattedDate;
};


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
  const [editable, setEditable] = useState(false);
  const [status, setStatus] = useState(null);

  const [billingModalVisible, setBillingModalVisible] = useState(false);
  const showBillingModal = (id, status) => {
    console.log(id)
    setAdmissionID(id);
    setEditable(isPatientOutOfER(status));
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
  
  const[discountModalVisible, setDiscountModalVisible] = useState(false);
  const showDiscountModal = (id, status) => {
    console.log(id)
    setAdmissionID(id);
    setStatus(status);
    setDiscountModalVisible(true);
  }
  const closeDiscountModal = () => {
    setDiscountModalVisible(false);
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
            showDiscountModal={showDiscountModal}
          />

          {billingModalVisible &&
            <BillingModal
            admissionID={admissionID}
            closeModal={closeBillingModal}
            editable={editable}
            />
          }

          {orderModalVisible &&
            <OrderModal
            admissionID={admissionID}
            closeModal={closeOrderModal}
            />
          }

          {discountModalVisible &&
            <DiscountModal
            admissionID={admissionID}
            closeModal={closeDiscountModal}
            status={status}
            />
          }
        </div>
      </div>
    </div>
  );
};

export default App;
