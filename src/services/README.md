# PrinterService

PrinterService is a service class that handles all printer-related operations for the thermal printer application.

## Overview

This service abstracts all printing logic and provides a clean interface for:
- Discovering printers (system, thermal, Bluetooth)
- Printing receipts to various printer types
- Handling images and Japanese text formatting

## Architecture

```
PrinterService
├── Printer Discovery
│   ├── getSystemPrinters()
│   ├── getThermalPrinters()
│   └── addDemoPrinter()
├── Printing Methods
│   ├── printDemoReceipt()
│   ├── printThermalReceiptSerial()
│   └── printSystemPrinter()
└── Helper Methods
    ├── printImageToThermal()
    ├── printItemsToThermal()
    ├── printFooterToThermal()
    ├── getImageForSystemPrint()
    └── generateReceiptHTML()
```

## Key Features

### 🖨️ Multi-Printer Support
- **System Printers**: Windows system printers via Electron print API
- **Thermal Bluetooth**: EPSON thermal printers over Bluetooth/Serial
- **Demo Mode**: Mock printer for testing without hardware

### 📷 Image Processing
- Upload custom logos/images
- Automatic resizing for 57mm thermal printers
- Base64 encoding for HTML printing
- Support for multiple image formats (PNG, JPG, SVG)

### 🇯🇵 Japanese Text Support
- Full Unicode support for Japanese characters
- Proper character set configuration for thermal printers
- Optimized formatting for 57mm receipts

### 🎯 Receipt Features
- Item lists with prices
- Automatic total calculation
- Date/time stamps
- Custom headers and footers
- Paper cutting (thermal printers)

## Usage

```javascript
const PrinterService = require('./PrinterService');

// Initialize service
const printerService = new PrinterService();
printerService.setMainWindow(electronMainWindow);

// Get available printers
const printers = await printerService.getAllPrinters();

// Print receipt
const result = await printerService.printReceipt(printerId, {
  title: 'カフェ・サクラ',
  items: [
    { name: 'コーヒー', price: 300 },
    { name: 'ケーキ', price: 450 }
  ],
  total: 750,
  image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAY...'
});
```

## Methods

### `setMainWindow(window)`
Sets the Electron main window reference for system printer access.

### `getAllPrinters()`
Returns array of all available printers with details:
```javascript
[
  {
    id: 'printer-id',
    name: 'Printer Name',
    displayName: 'Display Name',
    description: 'Description',
    status: 'available',
    type: 'system|thermal_bluetooth|thermal_usb',
    isDefault: true|false
  }
]
```

### `printReceipt(printerId, receiptData)`
Prints receipt to specified printer. Returns:
```javascript
{
  success: true|false,
  message: 'Status message'
}
```

## Receipt Data Format

```javascript
{
  title: 'Receipt Title',
  items: [
    { name: 'Item Name', price: 100 },
    // ... more items
  ],
  total: 500,
  image: 'data:image/png;base64,...' // Optional
}
```

## Dependencies

- `serialport`: For Bluetooth/Serial communication
- `node-thermal-printer`: ESC/POS thermal printing
- `jimp`: Image processing and resizing
- `electron`: System printer access and HTML printing

## Error Handling

The service includes comprehensive error handling:
- Connection failures (thermal printers)
- Image processing errors
- Missing printer errors
- Printing failures

All errors are logged and returned with descriptive messages.

## Future Enhancements

- USB thermal printer support
- Network printer discovery
- Print queue management
- Receipt templates
- Barcode/QR code printing
