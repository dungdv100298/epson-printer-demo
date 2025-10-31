# Development Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run electron-dev
   ```

This will start both the React development server and the Electron application.

## Project Structure

```
print-demo/
├── public/
│   ├── electron.js          # Main Electron process
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── PrinterList.js   # Printer list component
│   │   └── ReceiptForm.js   # Receipt form component
│   ├── App.js              # Main React app
│   ├── index.js            # React entry point
│   └── index.css           # Styles
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## Key Features Implemented

### 1. Printer Detection
- System printers (Windows)
- Serial/Bluetooth thermal printers
- Mock EPSON thermal printer for demo

### 2. React Frontend
- Modern, responsive UI
- Printer selection
- Receipt customization
- Japanese text support

### 3. Receipt Printing
- 57mm thermal receipt format
- Japanese text rendering
- Item list with prices
- Automatic total calculation

## Adding Thermal Printer Support

To add real thermal printer support:

1. **Install additional dependencies:**
   ```bash
   npm install escpos escpos-usb escpos-serialport
   ```

2. **Add Visual Studio Build Tools** (for native modules):
   - Download and install Visual Studio Build Tools
   - Or use: `npm install -g windows-build-tools`

3. **Update electron.js** to include ESC/POS commands for real printing

## Bluetooth Printer Setup

1. Pair your EPSON thermal printer with Windows
2. Note the COM port assigned
3. The app will automatically detect it as a serial device

## Building for Production

```bash
npm run dist
```

This creates a distributable Electron app in the `dist/` folder.

## Troubleshooting

### Common Issues

1. **Native module compilation errors:**
   - Install Visual Studio Build Tools
   - Use Node.js version 16 or 18

2. **Printer not detected:**
   - Check Windows Device Manager
   - Ensure drivers are installed
   - For Bluetooth: verify pairing and connection

3. **Japanese text not displaying:**
   - Ensure printer supports Japanese character sets
   - Some older thermal printers may have limited Unicode support

### Development Tips

- Use `npm run electron-dev` for development with hot reload
- Check the browser console in Electron DevTools for errors
- Test printer detection by clicking "Refresh Printers"
- Use the demo printer for testing without hardware
