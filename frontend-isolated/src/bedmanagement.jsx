import React, { useEffect, useState } from 'react';
import './inventory.css'; 
import quicker from "./assets/quicker.png";
import { useNavigate } from 'react-router-dom';
import { useConfig } from './util/ConfigContext';
import { useUser } from './auth/UserContext';
import secureFetch from './auth/SecureFetch';

function AddItem({ refreshBeds }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const AddSupply = (e) => {
    e.preventDefault();

    if (!serverUrl) return;
    setLoading(true)

    secureFetch(`${serverUrl}/beds/bed`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {        
        alert(`Successfully added a new bed. Update its location and status later.`);
        refreshBeds();
        e.target.reset();
      }
    })
    .catch(error => console.error(error)).finally(() => {
      setLoading(false)
    })
  }

  return (
    <div className="add-item-container">
      <h4 className="text-2xl mb-2">Add Bed to Bed Storage</h4>
      <form onSubmit={AddSupply}>
        <div className="table-container">
          <table>
            <tbody>
              <tr className='flex gap-2 pt-2'>
                
                <td className='flex-1'>                  
                  <span>All new beds will be stored as <code>inactive</code>. Assign the location and update the status later.</span>
                </td>

                <td className='flex-none !w-40'>
                  <button type="submit" className='w-full h-full'>Add a Bed</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}


function Beds ({ showUpdateModal, 
                      beds, 
                      loading, 
                      fetchBeds, 
                      setQuery, 
                      currentPage, 
                      setCurrentPage,
                      itemsPerPage}) {  

  const refreshBeds = () => {
    fetchBeds(); 
  };

  const NextPage = () => {
    if (currentPage < beds.totalPages - 1) {
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

      <h4 className="text-2xl mb-2">Beds</h4>

      {/* Search Bar */}
      
        <div className='flex gap-4'>
          <input
            type="text"
            className="w-full "
            id="searchInput"
            placeholder="Search Beds"
          />
          <button onClick={Search} className="btn btn-primary h-full !px-8">Search</button>
        </div>
      

      {/* Beds Table */}
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>Location Code</th>
            <th>Status</th>
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
            {beds?.content?.map((item) => (
              <tr key={item.id}>
                <td className='text-black'>{item.id}</td>
                <td className='text-black'>
                  {item.bedLocCode === 'LOC000' ? 'unassigned' : item.bedLocCode}
                  </td>
                <td className='text-black'>
                  <span className={"badge badge-soft " + 
                    (item.bedStatus === 'available' ? 'badge-success' 
                      : item.bedStatus === 'inactive' ? 'badge-error'
                      : item.bedStatus === 'maintenance' ? 'badge-warning'
                      : 'badge-neutral')
                  }>
                    {item.bedStatus}
                  </span>
                </td>
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
        !loading && beds?.pageable ? (
          <div className="pagination-controls">
            <button 
              onClick={PreviousPage} 
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span className='text-black'>
              Page {currentPage + 1} of {beds.totalPages}
            </span>
            <button 
              onClick={NextPage} 
              disabled={currentPage === beds.totalPages}
            >
              Next
            </button>
          </div>
        ) : null
      }

    </div>
  );
};

function Modal({ id, closeModal, refreshBeds }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [bed, setBed] = useState({});
  const [errors, setErrors] = useState({});

  const validateModel = () => {
    const foundErrors = validateBed(bed);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const FetchBeds = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/beds/${id}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {setBed(data)
      console.log(data)
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  const Update = () => {
    if (!serverUrl) return;
    console.log(`!validateModel(): ${!validateModel()}`)
    console.log(errors)
    if (!validateModel()) return;
    setLoading(true)

    const payload = {
      id: bed.id,
      bedLocCode: bed.bedLocCode,
      bedStatus: bed.bedStatus,
    };

    secureFetch(`${serverUrl}/beds/bed/${id}`, 
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log('response')
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {        
        refreshBeds();
        closeModal();
      }
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    FetchBeds();
  }, [id]);

  return (
    <div className='qe-modal-overlay'>      
        { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2">Bed No. {bed.id}</h4>
                <label className="input-group max-w-sm w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Location Code</span>
                  <input type="text" className="input grow !text-black" value={bed.bedLocCode}
                    onChange={e => setBed(prev => ({
                      ...prev,
                      bedLocCode: e.target.value
                    }))} />
                </label>

              <div className='w-full form-control'>
                <label className="input-group max-w-sm w-full max-w-full ">
                  <span className={"input-group-text font-bold uppercase text-nowrap " + 
                    (errors.bedStatus && "text-error")}>Status</span>
                  <select className={"w-full select grow " + 
                    (errors.bedStatus && "is-invalid text-error")} 
                    onChange={e => setBed(prev => ({
                      ...prev,
                      bedStatus: e.target.value
                    }))}
                    value={bed.bedStatus} >
                    <option value=''>Select a status</option>
                    <option value='available'>Available</option>
                    <option value='inactive'>Inactive</option>
                    <option value='disposed'>Disposed</option>
                    <option value='maintenance'>Under Maintenance</option>
                  </select>
                </label>
                {errors.bedStatus && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.bedStatus}</span>
                  </div>
                  )} 
              </div>

              <button onClick={Update} className="btn btn-primary">Update</button>
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
        )}
    </div>
  );
};

function validateBed(bed) {
  const foundErrors = {};
  if (!bed.bedLocCode) {
    foundErrors.bedLocCode = 'Location Code is required';
  } 
  if (!bed.bedStatus) {
    foundErrors.bedType = 'Status is required';
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
          <li className="nav-menu-item" onClick={() => navigate('/inventory')}>Inventory</li>
        }
        {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") &&
          <li className="nav-menu-item active" onClick={() => navigate('/beds')}>Bed Management</li>
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
  const [beds, setBeds] = useState({});
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);

  const fetchBeds = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/beds/search?` + new URLSearchParams({
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
      console.log(data)
      setBeds(data)
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }
  
  useEffect(() => {
    fetchBeds();
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
          {/* Beds */}
          <Beds
            showUpdateModal={showUpdateModal}
            beds={beds}
            loading={loading}
            fetchBeds={fetchBeds}
            setQuery={setQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>

        {/* Add Item Below Beds */}
        <AddItem          
          refreshBeds={fetchBeds} />
      </div>

      {/* Modal for Quantity Input */}
      {modalVisible && (currentItemID !== null) && (
        <Modal
          id={currentItemID}
          closeModal={closeModal}
          refreshBeds={fetchBeds}
        />
      )}      

    </div>
  );
};

export default App;
