import React, { useEffect, useState } from 'react';
import './inventory.css'; 
import quicker from "./assets/quicker.png";
import { useNavigate } from 'react-router-dom';
import { useConfig } from './util/ConfigContext';

function AddItem({ addItemToInventory }) {
  const [id, setId] = useState('');
  const [supplyName, setSupplyName] = useState('');
  const [supplyType, setSupplyType] = useState('');
  const [supplyQty, setSupplyQty] = useState('');
  const [supplyPrice, setSupplyPrice] = useState(''); // New state for price
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!supplyName || !supplyType || !supplyQty || !supplyPrice || isNaN(supplyQty) || supplyQty <= 0 || isNaN(supplyPrice) || supplyPrice <= 0) {
      setError('Please fill in all fields with valid data');
      return;
    }

    const newItem = {
      id: Date.now(),
      itemName: supplyName,
      brand: supplyType,
      quantity: parseInt(supplyQty),
      price: parseFloat(supplyPrice), // Include price
    };

    addItemToInventory(newItem);
    setSupplyName('');
    setSupplyType('');
    setSupplyQty('');
    setSupplyPrice('');
  };

  return (
    <div className="add-item-container">
      <h4 className="text-2xl mb-2">Add Item to Inventory</h4>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="table-container">
          <table>
            <tbody>
              <tr className='flex gap-2'>
                <td className='flex-1'>
                  <input
                    type="text"
                    value={supplyName}
                    onChange={(e) => setSupplyName(e.target.value)}
                    placeholder="Item Name"
                  />
                </td>
                <td className='flex-none !w-52'>
                  <input
                    type="text"
                    value={supplyType}
                    onChange={(e) => setSupplyType(e.target.value)}
                    placeholder="Brand Name"
                  />
                </td>
                <td className='flex-none !w-28'>
                  <input
                    type="number"
                    value={supplyQty}
                    onChange={(e) => setSupplyQty(e.target.value)}
                    placeholder="Quantity"
                  />
                </td>
                <td className='flex-none !w-32'>
                  <input
                    type="number"
                    value={supplyPrice}
                    onChange={(e) => setSupplyPrice(e.target.value)}
                    placeholder="Price"
                  />
                </td>
                <td className='flex-none !w-20'>
                  <button type="submit" className='w-full'>Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}

function Table() {
  const { serverUrl } = useConfig();
  const [supplies, setSupplies] = useState({});
  const [ query, setQuery ] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!serverUrl) return;
    setLoading(true)
    fetch(`${serverUrl}/supplies/search?` + new URLSearchParams({
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

  }, [currentPage, itemsPerPage, serverUrl]);

  useEffect(() => {
    console.log(supplies);
  }, [supplies]);

  return (
    <div className="border-base-content/25 w-full overflow-x-auto h-fit rounded-lg border shadow">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        {
          loading ? (<span>loading</span>)
                  : (
                    <tbody>
                      {
                        // console.log(supplies.content)
                        supplies?.content?.map((supply) => (                          
                          <tr className='hover'>
                            <th scope="row">{supply.id}</th>
                            <td>{supply.supplyName}</td>
                            <td>{supply.supplyType}</td>
                            <td>{supply.supplyQty}</td>
                            <td>{supply.supplyPrice}</td>
                            <td><button class="btn btn-circle btn-text btn-sm" aria-label="Action button"><span class="icon-[tabler--pencil]"></span></button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                    )
        }
      </table>
    </div>
  )
}


function Inventory ({ showUpdateModal, inventory, handleDeleteItem, onSearch }) {  
  const { serverUrl } = useConfig();
  const [supplies, setSupplies] = useState({});
  const [ query, setQuery ] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!serverUrl) return;
    setLoading(true)
    fetch(`${serverUrl}/supplies/search?` + new URLSearchParams({
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

  }, [currentPage, itemsPerPage, serverUrl]);

  useEffect(() => {
    console.log(supplies);
  }, [supplies]);


  return (
    <div className="inventory-container">
      <h4 className="text-2xl mb-2">Inventory</h4>

      {/* Search Bar */}
      
        <div className='flex gap-4'>
          <input
            type="text"
            className="w-full "
            id="searchInput"
            placeholder="Search Inventory"
            onChange={onSearch}    
          />
          <button className="btn btn-primary h-full !px-8">Search</button>
        </div>
      

      {/* Inventory Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        {
          loading ? (<span>loading</span>)
                  : (
                    // console.log(supplies.content)
                    <tbody>
                      {
                      supplies?.content?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.supplyName}</td>
                          <td>{item.supplyType}</td>
                          <td>{item.supplyQty}</td>
                          <td>₱{item.supplyPrice}</td> {/* Display price */}
                          <td>
                            <span class="icon-[tabler--pencil]"></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )
        }
      </table>


      {/* Pagination Controls */}
      {/* <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div> */}

    </div>
  );
};




const Modal = ({ quantityNeeded, setQuantityNeeded, onUpdateQuantity, closeModal, error }) => {
  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <h3>Enter Quantity</h3>
        <input
          type="number"
          value={quantityNeeded}
          onChange={(e) => setQuantityNeeded(e.target.value)}
          placeholder="Enter quantity needed"
        />
        {error && <p className="error-message">{error}</p>}
        <button onClick={onUpdateQuantity} className="smaller-update-button" >Add to Order</button>
        <button onClick={closeModal} className="smaller-update-button">Close</button>
      </div>
    </div>
  );
};


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
        <li className="menu-item active" onClick={() => navigate('/inventory')}>Inventory</li>
        <li className="menu-item" onClick={() => navigate('/bedmanagement')}>Bed Management</li>
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
function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [inventory, setInventory] = useState([
    // Sample data
  ]);
  const [filteredInventory, setFilteredInventory] = useState(inventory);

  const [lastOrderId, setLastOrderId] = useState(0);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    if (query) {
      const filtered = inventory.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query)
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventory);
    }
  };

  const showUpdateModal = (item) => {
    setCurrentItem({ ...item, quantityNeeded: item.quantity });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Handle adding item to order
  const handleAddToOrder = () => {
    if (currentItem) {
      const quantityNeeded = parseInt(currentItem.quantityNeeded);
  
      if (quantityNeeded > currentItem.quantity) {
        alert(`You cannot order more than the available quantity of ${currentItem.quantity}`);
        return;
      }
  
      const newOrder = {
        ...currentItem,
        orderId: `ORD-${Date.now()}`,
        quantity: quantityNeeded,
      };
  
      // Update inventory
      const updatedInventory = inventory.map((item) =>
        item.id === currentItem.id
          ? { ...item, quantity: item.quantity - quantityNeeded }
          : item
      );
  
      setInventory(updatedInventory);
      closeModal();
    }
  };


  const addItemToInventory = (newItem) => {
    setInventory((prevInventory) => {
      const updatedInventory = [...prevInventory, newItem];
      setFilteredInventory(updatedInventory);
      return updatedInventory;
    });
  };

  // Delete item from inventory
  const handleDeleteItem = (itemId) => {
    const updatedInventory = inventory.filter(item => item.id !== itemId);
    setInventory(updatedInventory);
    setFilteredInventory(updatedInventory);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', position: 'relative' }}>
      <Sidebar />
      <div className="main-container">
        <div className="content-container">
          {/* <Table /> */}
          {/* Inventory */}
          <Inventory
            showUpdateModal={showUpdateModal}
            inventory={filteredInventory}
            handleDeleteItem={handleDeleteItem}
            onSearch={handleSearch}
          />
        </div>

        {/* Add Item Below Inventory */}
        <AddItem addItemToInventory={addItemToInventory} />
      </div>

      {/* Modal for Quantity Input */}
      {modalVisible && currentItem && (
        <Modal
          quantityNeeded={currentItem.quantityNeeded}
          setQuantityNeeded={(quantity) => setCurrentItem({ ...currentItem, quantityNeeded: quantity })}
          onUpdateQuantity={handleAddToOrder}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default App;
