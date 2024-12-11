import React, { useEffect, useState } from 'react';
import './inventory.css'; 
import quicker from "./assets/quicker.png";
import { useNavigate } from 'react-router-dom';
import { useConfig } from './util/ConfigContext';
import { useUser } from './auth/UserContext';
import secureFetch from './auth/SecureFetch';

function AddItem({ refreshInventory }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [isSupplyQty, setIsSupplyQty] = useState('');
  const [errors, setErrors] = useState({});

  const validateModel = (supply) => {
    const foundErrors = validateSupply(supply);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const AddSupply = (e) => {
    e.preventDefault();

    if (!serverUrl) return;

    const formData = new FormData(e.target);
    const supply = {
      supplyName: formData.get("supplyName"),
      supplyType: formData.get("supplyType"),
      supplyQty: formData.get("supplyQty"),
      supplyPrice: formData.get("supplyPrice"),
    };

    console.log(supply)
    if (!validateModel(supply)) return;
    setLoading(true)

    const payload = {
      supplyName: supply.supplyName,
      supplyType: supply.supplyType,
      supplyQty: supply.supplyQty,
      supplyPrice: supply.supplyPrice
    };

    secureFetch(`${serverUrl}/supplies/supply`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {        
        alert(`Successfully added ${supply.supplyQty}pcs ` + 
              `of ${supply.supplyName} ` + 
              ` (${supply.supplyType}) ` + 
              `for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(supply.supplyPrice)} each.`);
        refreshInventory();
        e.target.reset();
      }
    })
    .catch(error => console.error(error)).finally(() => {
      setLoading(false)
    })
  }

  return (
    <div className="add-item-container">
      <h4 className="text-2xl mb-2">Add Item to Inventory</h4>
      {/* {errors && <p className="error-message">{errors}</p>} */}
      <form onSubmit={AddSupply}>
        <div className="table-container">
          <table>
            <tbody>
              <tr className='flex gap-2 pt-2'>
                
                <td className='flex-1'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="text" name='supplyName' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyName && "is-invalid")} />
                      <span className="input-floating-label">Name</span>
                    </div>
                    <div className="label">
                      {errors.supplyName && (
                        <span className="label-text-alt">{errors.supplyName}</span>
                      )}
                    </div>
                  </label>
                </td>

                <td className='flex-1'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="text" name='supplyType' list='typeOptions' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyType && "is-invalid")}
                          onChange={(e) => {
                            const isSupply = e.target.value.includes("supply:");
                            if (!isSupply) {
                              setIsSupplyQty(-1)
                            } else {
                              setIsSupplyQty('')
                            }
                          }} />
                      <datalist id="typeOptions">
                        <option value="test:Laboratory"></option>
                        <option value="test:Imaging"></option>
                        <option value="test:Diagnostic"></option>
                        <option value="treatment:Treatment"></option>
                        <option value="supply:Respiratory"></option>
                        <option value="supply:Wound_Care"></option>
                        <option value="supply:IV"></option>
                        <option value="supply:Medication"></option>
                        <option value="supply:Monitoring"></option>
                        <option value="supply:Diagnostic"></option>
                        <option value="supply:Resuscitation"></option>
                        <option value="supply:PPE"></option>
                        <option value="supply:Orthopedic"></option>
                        <option value="supply:PatientTransport"></option>
                        <option value="supply:Surgical"></option>
                        <option value="supply:Miscellaneous"></option>
                      </datalist>
                      <span className="input-floating-label">Type</span>
                    </div>
                    <div className="label">
                      {errors.supplyType && (
                        <span className="label-text-alt">{errors.supplyType}</span>
                      )}
                    </div>
                  </label>
                </td>
                
                <td className='flex-1'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="number" name='supplyQty' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyQty && "is-invalid")} 
                          value={isSupplyQty}
                          onChange={e => setIsSupplyQty(e.target.value)}
                          disabled={isSupplyQty === -1} />
                      <span className="input-floating-label">Quantity</span>
                    </div>
                    <div className="label">
                      {errors.supplyQty && (
                        <span className="label-text-alt">{errors.supplyQty}</span>
                      )}
                    </div>
                  </label>
                </td>

                <td className='flex-1'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="number" name='supplyPrice' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyPrice && "is-invalid")} />
                      <span className="input-floating-label">Price</span>
                    </div>
                    <div className="label">
                      {errors.supplyPrice && (
                        <span className="label-text-alt">{errors.supplyPrice}</span>
                      )}
                    </div>
                  </label>
                </td>

                <td className='flex-none !w-20'>
                  <button type="submit" className='w-full h-full'>Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}


function Inventory ({ showUpdateModal, 
                      supplies, 
                      loading, 
                      FetchSupplies, 
                      setQuery, 
                      currentPage, 
                      setCurrentPage,
                      itemsPerPage}) {  

  const [activeFilter, setActiveFilter] = useState('');

  const refreshInventory = () => {
    FetchSupplies(); 
  };

  const NextPage = () => {
    if (currentPage < supplies.totalPages - 1) {
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

      <div className='flex flex-col gap-4 mb-4'>
        <h4 className="text-2xl">Inventory</h4>
        <div className='flex gap-2 flex-1'>
          <div>Filter: </div>

          <button onClick={() => {
            setActiveFilter('test');
            setQuery('test:');
          }} className={"btn btn-xs btn-primary flex-1 !p-2 h-full + "
            + (activeFilter !== 'test' && "btn-soft")
          }>Tests</button>

          <button onClick={() => {
            setActiveFilter('treatment');
            setQuery('treatment:');
          }} className={"btn btn-xs btn-primary flex-1 !p-2 h-full + "
            + (activeFilter !== 'treatment' && "btn-soft")
          }>Treatment</button>

          <button onClick={() => {
            setActiveFilter('supply');
            setQuery('supply:');
          }} className={"btn btn-xs btn-primary flex-1 !p-2 h-full + "
            + (activeFilter !== 'supply' && "btn-soft")
          }>Supplies</button>
          
          <button onClick={() => {
            setActiveFilter('');
            setQuery('');
          }} className="btn btn-xs btn-secondary flex-none !px-3 h-full">Reset</button>
        </div>
      </div>

      {/* Search Bar */}
      
        <div className='flex gap-4'>
          <input
            type="text"
            className="w-full "
            id="searchInput"
            placeholder="Search Inventory"
          />
          <button onClick={Search} className="btn btn-primary h-full !px-8">Search</button>
        </div>
      

      {/* Inventory Table */}
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>Name</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Price</th>
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
            {supplies?.content?.map((item) => (
              <tr key={item.id}>
                <td className='text-black'>{item.id}</td>
                <td className='text-black'>{item.supplyName}</td>
                <td className='text-black'>{item.supplyType}</td>
                <td className='text-black'>{item.supplyQty == -1 ? ( '\u221E (Service)' ) : item.supplyQty}</td>
                <td className='text-black'>{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.supplyPrice)}</td>
                <td className='text-black flex justify-center'>
                  <button type="button" onClick={() => showUpdateModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                    <span className="icon-[tabler--pencil] text-neutral-500"></span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {/* Pagination Controls */}
      {
        !loading && supplies?.pageable ? (
          <div className="pagination-controls">
            <button 
              onClick={PreviousPage} 
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span className='text-black'>
              Page {currentPage + 1} of {supplies.totalPages}
            </span>
            <button 
              onClick={NextPage} 
              disabled={supplies.totalPages === 1 || (currentPage === supplies.totalPages)}
            >
              Next
            </button>
          </div>
        ) : null
      }

    </div>
  );
};

function Modal({ id, closeModal, refreshInventory }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [supply, setSupply] = useState({});
  const [errors, setErrors] = useState({});

  const validateModel = () => {
    const foundErrors = validateSupply(supply);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const FetchSupply = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/supplies/${id}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => setSupply(data))
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  const UpdateSupply = () => {
    if (!serverUrl) return;
    console.log(`!validateModel(): ${!validateModel()}`)
    console.log(errors)
    if (!validateModel()) return;
    setLoading(true)

    const payload = {
      id: supply.id,
      supplyName: supply.supplyName,
      supplyType: supply.supplyType,
      supplyQty: supply.supplyQty,
      supplyPrice: supply.supplyPrice
    };

    secureFetch(`${serverUrl}/supplies/supply/${id}`, 
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {        
        refreshInventory();
        closeModal();
      }
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    FetchSupply();
  }, [id]);

  return (
    <div className='qe-modal-overlay'>      
        { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2">Inventory Item No. {supply.id}</h4>

              <label className="input-group max-w-sm w-full max-w-full">
                <span className="input-group-text font-bold uppercase">Name</span>
                <input type="text" className="input grow !text-black" value={supply.supplyName} readOnly disabled />
              </label>
              
              <label className="input-group max-w-sm w-full max-w-full">
                <span className="input-group-text font-bold uppercase">Type</span>
                <input type="text" className="input grow !text-black" value={supply.supplyType} readOnly disabled />
              </label>

              <div className='w-full gap-4 flex'>

                <div className='form-control max-w-sm'>
                  <label className="input-group max-w-sm w-full max-w-full">
                    <span className={"input-group-text font-bold uppercase " + 
                      (errors.supplyQty && "text-error")}>QUANTITY</span>
                    <input type="number" className={"input grow !text-black " + 
                      (errors?.supplyQty && "is-invalid text-error ")} value={supply.supplyQty}
                      onChange={(e) => setSupply((prev) => ({
                        ...prev,
                        supplyQty: parseInt(e.target.value)
                      }))}
                      readOnly={!supply?.supplyType?.includes('supply:')} disabled={!supply?.supplyType?.includes('supply:')}
                    />
                  </label>
                  {errors.supplyQty && (
                    <div className="label">
                      <span className="label-text-alt text-error">{errors.supplyQty}</span>
                    </div>
                    )} 
                </div>

                <div className='form-control max-w-sm'>
                  <label className="input-group max-w-sm w-full max-w-full ">
                    <span className={"input-group-text font-bold uppercase text-nowrap " + 
                      (errors.supplyPrice && "text-error")}>PRICE (PHP)</span>
                    <input type="number" className={"input grow " + 
                      (errors.supplyPrice && "is-invalid text-error")} 
                      onChange={(e) => setSupply((prev) => ({
                        ...prev,
                        supplyPrice: parseInt(e.target.value)
                      }))}
                      value={supply.supplyPrice || ''} />
                  </label>
                  {errors.supplyPrice && (
                    <div className="label">
                      <span className="label-text-alt text-error">{errors.supplyPrice}</span>
                    </div>
                    )} 
                </div>

              </div>

              <button onClick={UpdateSupply} className="btn btn-primary">Update</button>
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
        )}
    </div>
  );
};

function validateSupply(supply) {
  const foundErrors = {};
  if (!supply.supplyName) {
    foundErrors.supplyName = 'Name is required';
  } 
  if (!supply.supplyType) {
    foundErrors.supplyType = 'Type is required';
  }
  const isSupply = supply.supplyType.includes("supply:");
  if (isSupply && (supply.supplyQty < 0 || supply.supplyQty === '')) {
    foundErrors.supplyQty = 'Supply quantity cannot be negative';
  }
  if (supply.supplyPrice <= 0) {
    foundErrors.supplyPrice = 'Price cannot be free or negative';
  }
  return foundErrors;
}



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
          <li className="nav-menu-item active" onClick={() => navigate('/inventory')}>Inventory</li>
        }
        {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/beds')}>Bed Management</li>
        }        
        {(user.role == "ADMIN" || user.role == "STAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/billing')}>Billing</li>
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
  

// App Component (Main Entry Point)
function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItemID, setCurrentItemID] = useState(null);
  
  const { serverUrl } = useConfig();
  const [supplies, setSupplies] = useState({});
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);

  const FetchSupplies = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/supplies/search?` + new URLSearchParams({
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
    .then(data => setSupplies(data))
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }
  
  useEffect(() => {
    FetchSupplies();
  }, [query, currentPage, itemsPerPage, serverUrl]);

  const showUpdateModal = (item) => {
    console.log('showUpdateModal', item);
    setCurrentItemID(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', position: 'relative' }}>
      <Sidebar />
      <div className="main-container">
        <div className="content-container">
          {/* Inventory */}
          <Inventory
            showUpdateModal={showUpdateModal}
            supplies={supplies}
            loading={loading}
            FetchSupplies={FetchSupplies}
            setQuery={setQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>

        {/* Add Item Below Inventory */}
        <AddItem          
          refreshInventory={FetchSupplies} />
      </div>

      {/* Modal for Quantity Input */}
      {modalVisible && (currentItemID !== null) && (
        <Modal
          id={currentItemID}
          closeModal={closeModal}
          refreshInventory={FetchSupplies}
        />
      )}

      

    </div>
  );
};

export default App;
