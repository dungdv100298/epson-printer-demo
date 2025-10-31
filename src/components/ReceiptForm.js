import React, { useState, useRef } from 'react';

const ReceiptForm = ({ selectedPrinter, onPrint, loading }) => {
  const [receiptData, setReceiptData] = useState({
    title: 'レシート',
    items: [
      { name: 'コーヒー', price: 300 },
      { name: 'サンドイッチ', price: 450 }
    ],
    total: 750,
    image: null
  });

  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setReceiptData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receiptData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'price' ? parseFloat(value) || 0 : value
    };
    
    setReceiptData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Auto-calculate total
    const total = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0);
    setReceiptData(prev => ({
      ...prev,
      total: total
    }));
  };

  const addItem = () => {
    if (newItem.name && newItem.price) {
      const price = parseFloat(newItem.price) || 0;
      const updatedItems = [...receiptData.items, { name: newItem.name, price: price }];
      
      setReceiptData(prev => ({
        ...prev,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price || 0), 0)
      }));
      
      setNewItem({ name: '', price: '' });
    }
  };

  const removeItem = (index) => {
    const updatedItems = receiptData.items.filter((_, i) => i !== index);
    setReceiptData(prev => ({
      ...prev,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + (item.price || 0), 0)
    }));
  };

  const handlePrint = () => {
    onPrint(receiptData);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setImagePreview(imageData);
        setReceiptData(prev => ({
          ...prev,
          image: imageData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setReceiptData(prev => ({
      ...prev,
      image: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSampleReceipt = () => {
    setReceiptData({
      title: 'カフェ・サクラ',
      items: [
        { name: 'アメリカーノ', price: 280 },
        { name: 'チーズケーキ', price: 420 },
        { name: 'クロワッサン', price: 180 },
        { name: 'カプチーノ', price: 350 }
      ],
      total: 1230,
      image: receiptData.image // Keep existing image
    });
  };

  return (
    <div className="section">
      <h2>Receipt Printing</h2>

      {!selectedPrinter && (
        <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠️ Please select a printer from the list first
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Receipt Title (Japanese supported):</label>
        <input
          type="text"
          id="title"
          value={receiptData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., レシート, カフェ・サクラ"
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Logo/Image for Receipt:</label>
        <input
          type="file"
          id="image"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ marginBottom: '10px' }}
        />
        {imagePreview && (
          <div style={{ marginBottom: '10px' }}>
            <img 
              src={imagePreview} 
              alt="Receipt Logo" 
              style={{ 
                maxWidth: '150px', 
                maxHeight: '100px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                display: 'block',
                marginBottom: '5px'
              }} 
            />
            <button 
              type="button" 
              onClick={removeImage}
              style={{ 
                background: '#f44336', 
                color: 'white', 
                border: 'none', 
                padding: '5px 10px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      <div className="receipt-items">
        <h3>Receipt Items:</h3>
        
        {receiptData.items.map((item, index) => (
          <div key={index} className="receipt-item">
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              placeholder="Item name (Japanese supported)"
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              placeholder="Price (¥)"
              style={{ width: '100px' }}
            />
            <button onClick={() => removeItem(index)}>Remove</button>
          </div>
        ))}

        <div className="receipt-item">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            placeholder="New item name"
          />
          <input
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
            placeholder="Price (¥)"
            style={{ width: '100px' }}
          />
          <button className="add-item-btn" onClick={addItem}>Add</button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="total">Total Amount (¥):</label>
        <input
          type="number"
          id="total"
          value={receiptData.total}
          onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
        />
      </div>

      <button 
        className="add-item-btn" 
        onClick={loadSampleReceipt}
        style={{ marginBottom: '20px', background: '#2196f3' }}
      >
        Load Sample Japanese Receipt
      </button>

      <button
        className="print-btn"
        onClick={handlePrint}
        disabled={!selectedPrinter || loading}
      >
        {loading ? 'Printing...' : 'Print Receipt (57mm)'}
      </button>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Receipt Preview:</h4>
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.4' }}>
          {receiptData.title}
          {'\n------------------------\n'}
          {receiptData.items.map(item => `${item.name}: ¥${item.price}`).join('\n')}
          {'\n------------------------\n'}
          {`合計: ¥${receiptData.total}`}
          {'\n\nありがとうございました\n'}
        </div>
      </div>
    </div>
  );
};

export default ReceiptForm;
