import React, { useState } from 'react';
import './inventory.css'; 
import quicker from "./assets/quicker.png";
import { useNavigate } from 'react-router-dom';
// AddItem Component


function AddItem({ addItemToInventory }) {
  const [itemName, setItemName] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(''); // New state for price
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!itemName || !brand || !quantity || !price || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
      setError('Please fill in all fields with valid data');
      return;
    }

    const newItem = {
      id: Date.now(),
      itemName,
      brand,
      quantity: parseInt(quantity),
      price: parseFloat(price), // Include price
    };

    addItemToInventory(newItem);
    setItemName('');
    setBrand('');
    setQuantity('');
    setPrice('');
  };

  return (
    <div className="add-item-container">
      <h3>Add Item to Inventory</h3>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Brand</th>
                <th>Quantity</th>
                <th>Price</th> {/* New column */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Item Name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Brand Name"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Quantity"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price"
                  />
                </td>
                <td>
                  <button type="submit">Add Item</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}


const Inventory = ({ showUpdateModal, inventory, handleDeleteItem, onSearch }) => {
   
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inventory.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="inventory-container">
      <h3>Inventory</h3>

      {/* Search Bar */}
      
        <input
          type="text"
          className="search-bar"
          id="searchInput"
          placeholder="Search Inventory"
          onChange={onSearch}
     
        />
      

      {/* Inventory Table */}
      <table>
  <thead>
    <tr>
      <th>Item Name</th>
      <th>Brand</th>
      <th>Quantity</th>
      <th>Price</th> {/* New column */}
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {currentItems.map((item) => (
      <tr key={item.id}>
        <td>{item.itemName}</td>
        <td>{item.brand}</td>
        <td>{item.quantity}</td>
        <td>₱{item.price.toFixed(2)}</td> {/* Display price */}
        <td>
          <button onClick={() => showUpdateModal(item)} class="smaller-update-button">Add to Order List</button>
          <button
            onClick={() => handleDeleteItem(item.id)}
           class="smaller-update-button"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


      {/* Pagination Controls */}
      <div className="pagination-controls">
  <button onClick={handlePreviousPage} disabled={currentPage === 1}>
    Previous
  </button>
  <span>
    Page {currentPage} of {totalPages}
  </span>
  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
    Next
  </button>
</div>

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
  return (
    <div className="emergency-room-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <img src={quicker} alt="Quicker Logo" className="logo" />
        <ul className="menu">
          <li className="menu-item" onClick={() => navigate('/emergency')}>Emergency Room</li>
          <li className="menu-item active"onClick={() => navigate('/inventory')}>Inventory</li>
          <li className="menu-item" onClick={() => navigate('/billing')}>Billing</li>
        </ul>
      </aside>
    </div>
  );
};

// OrderList Component
function OrderList({ orderList, handleConfirmOrder, setOrderList }) {
  const handleFinishOrder = () => {
    const patientID = prompt("Please enter the Patient ID:");
    if (patientID) {
      console.log(`Order completed for Patient ID: ${patientID}`);
      setOrderList([]); // Clear the order list
    } else {
      alert("Patient ID is required to finish the order.");
    }
  };

  return (
    <div className="order-list-container">
      <h2>Order List</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Price</th> {/* New column */}
            <th>Total</th> {/* New column */}
          </tr>
        </thead>
        <tbody>
          {orderList.map((order, index) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.itemName}</td>
              <td>{order.quantity}</td>
              <td>₱{order.price.toFixed(2)}</td> {/* Price per item */}
              <td>₱{(order.price * order.quantity).toFixed(2)}</td> {/* Total price */}
            </tr>
          ))}
        </tbody>
      </table>
      {orderList.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handleFinishOrder}
            style={{
              padding: "10px 15px",
              backgroundColor: "#28a745",
              color: "#FFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Finish Order
          </button>
        </div>
      )}
    </div>
  );
}


  

// App Component (Main Entry Point)
const App = () => {
  const [orderList, setOrderList] = useState([]);
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
  
      const updatedOrderList = [...orderList, newOrder];
  
      setOrderList(updatedOrderList);
  
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
  
  


  const handleConfirmOrder = (index) => {
    const newOrders = [...orderList];
    newOrders[index].confirmed = true;
    setOrderList(newOrders);
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
          {/* Inventory */}
          <Inventory
            showUpdateModal={showUpdateModal}
            inventory={filteredInventory}
            handleDeleteItem={handleDeleteItem}
            onSearch={handleSearch}
          />

          {/* Order List */}
          <OrderList 
  orderList={orderList} 
  handleConfirmOrder={handleConfirmOrder} 
  setOrderList={setOrderList} 
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
