import React from 'react';

const PrinterList = ({ printers, selectedPrinter, onSelectPrinter, onRefresh, loading }) => {
  const getPrinterTypeLabel = (type) => {
    switch (type) {
      case 'thermal_usb':
        return 'USB Thermal';
      case 'thermal_bluetooth':
        return 'Bluetooth Thermal';
      case 'system':
        return 'System Printer';
      default:
        return 'Unknown';
    }
  };

  const getPrinterIcon = (type) => {
    switch (type) {
      case 'thermal_usb':
        return '🖨️';
      case 'thermal_bluetooth':
        return '📶';
      case 'system':
        return '🖥️';
      default:
        return '❓';
    }
  };

  return (
    <div className="section">
      <h2>Available Printers</h2>
      
      <button 
        className="refresh-btn" 
        onClick={onRefresh} 
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Printers'}
      </button>

      {loading && <div className="loading">Scanning for printers...</div>}

      <div className="printer-list">
        {printers.length === 0 && !loading && (
          <div className="loading">No printers found. Click refresh to scan again.</div>
        )}

        {printers.map((printer) => (
          <div
            key={printer.id}
            className={`printer-item ${selectedPrinter?.id === printer.id ? 'selected' : ''}`}
            onClick={() => onSelectPrinter(printer)}
          >
            <div className="printer-name">
              {getPrinterIcon(printer.type)} {printer.displayName}
            </div>
            <div className="printer-details">
              <div>Type: {getPrinterTypeLabel(printer.type)}</div>
              <div>Status: {printer.status}</div>
              {printer.description && <div>Description: {printer.description}</div>}
              {printer.path && <div>Port: {printer.path}</div>}
              {printer.isDefault && <div>✅ Default Printer</div>}
            </div>
            <span className={`printer-type ${printer.type}`}>
              {getPrinterTypeLabel(printer.type)}
            </span>
          </div>
        ))}
      </div>

      {selectedPrinter && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e8', borderRadius: '8px' }}>
          <strong>Selected Printer:</strong> {selectedPrinter.displayName}
          <br />
          <small>Type: {getPrinterTypeLabel(selectedPrinter.type)}</small>
        </div>
      )}
    </div>
  );
};

export default PrinterList;
