# Thermal Printer Demo

An Electron application with React frontend for managing thermal printers and printing receipts with Japanese text support.

## Features

- **Printer Detection**: Automatically detects system printers, USB thermal printers, and Bluetooth thermal printers
- **Japanese Text Support**: Full support for Japanese characters in receipt printing
- **57mm Thermal Printing**: Optimized for 57mm thermal receipt printers
- **EPSON Printer Support**: Special support for EPSON thermal printers
- **Bluetooth Connectivity**: Connect to Bluetooth thermal printers
- **Receipt Customization**: Create custom receipts with multiple items and totals
- **Image/Logo Support**: Upload and print custom logos or images on receipts
- **Real Printing**: Actual printing to thermal printers and system printers (not just simulation)

## Prerequisites

- Node.js (version 16 or higher)
- Visual Studio Build Tools (for native module compilation)
- Windows 10/11

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To run the application in development mode:

```bash
npm run electron-dev
```

This will start both the React development server and the Electron application.

## Building

To build the application for production:

```bash
npm run dist
```

## Printer Setup

### USB Thermal Printers
1. Connect your EPSON thermal printer via USB
2. Install the printer drivers if needed
3. The application will automatically detect USB thermal printers

### Bluetooth Thermal Printers
1. Pair your EPSON thermal printer with Windows via Bluetooth
2. Make sure the printer is connected and shows as a COM port
3. The application will detect Bluetooth printers as serial devices

## Supported Printers

- EPSON TM series thermal printers (TM-T20, TM-T82, etc.)
- Any ESC/POS compatible thermal printer
- Standard Windows system printers
- Bluetooth thermal printers

## Usage

1. Launch the application
2. Click "Refresh Printers" to scan for available printers
3. Select your thermal printer from the list
4. Customize your receipt content (Japanese text supported)
5. Click "Print Receipt" to print on 57mm thermal paper

## Supported Receipt Features

- Japanese text (Hiragana, Katakana, Kanji)
- Item lists with prices
- Automatic total calculation
- Standard receipt formatting
- 57mm paper width optimization
- Custom logo/image printing
- Date and time stamps
- Automatic paper cutting (thermal printers)

## Troubleshooting

### Printer Not Detected
- Make sure the printer is properly connected
- For Bluetooth printers, ensure they are paired and connected
- Try clicking "Refresh Printers"
- Check Windows Device Manager for any driver issues

### Printing Issues
- Verify the printer has paper and is ready
- Check if the printer supports ESC/POS commands
- For Bluetooth printers, ensure stable connection

### Japanese Text Issues
- The application uses UTF-8 encoding
- Make sure your thermal printer supports Japanese character sets
- Some older printers may not display all Japanese characters correctly

## Dependencies

- Electron: Desktop application framework
- React: Frontend framework
- node-thermal-printer: Thermal printer control
- escpos: ESC/POS printer commands
- serialport: Serial/Bluetooth communication

## License

This project is for demonstration purposes.
