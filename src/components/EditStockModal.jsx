const EditStockModal = ({ stock, onClose, onSave }) => {
  const [updatedStock, setUpdatedStock] = useState(stock);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedStock((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Call the save function passed as a prop
    onSave(updatedStock);
    onClose();
  };

  return (
    <div className="modal">
      <h3>Edit Stock</h3>
      <input type="text" name="allocatedDept" value={updatedStock.allocatedDept} onChange={handleChange} />
      <input type="text" name="roomNo" value={updatedStock.roomNo} onChange={handleChange} />
      <input type="text" name="specification" value={updatedStock.specification} onChange={handleChange} />
      <input type="number" name="quantity" value={updatedStock.quantity} onChange={handleChange} />
      {/* Add more fields as needed */}
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};
