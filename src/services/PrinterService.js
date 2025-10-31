const { SerialPort } = require('serialport');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

class PrinterService {
  constructor() {
    this.mainWindow = null;
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  async getAllPrinters() {
    try {
      const printers = [];
      
      // Get system printers
      await this.getSystemPrinters(printers);
      
      // Get Serial/Bluetooth thermal printers
      await this.getThermalPrinters(printers);
      
      // Add demo printer
      this.addDemoPrinter(printers);

      return printers;
    } catch (error) {
      console.error('Error getting printers:', error);
      throw error;
    }
  }

  async getSystemPrinters(printers) {
    try {
      if (!this.mainWindow) {
        throw new Error('Main window not set');
      }

      const systemPrinters = await this.mainWindow.webContents.getPrintersAsync();
      
      systemPrinters.forEach(printer => {
        printers.push({
          id: printer.name,
          name: printer.name,
          displayName: printer.displayName || printer.name,
          description: printer.description || '',
          status: printer.status,
          type: 'system',
          isDefault: printer.isDefault
        });
      });
    } catch (error) {
      console.log('Error getting system printers:', error.message);
    }
  }

  async getThermalPrinters(printers) {
    try {
      const serialPorts = await SerialPort.list();
      serialPorts.forEach(port => {
        const isBluetoothThermal = port.friendlyName && 
          (port.friendlyName.toLowerCase().includes('bluetooth') ||
           port.friendlyName.toLowerCase().includes('thermal') ||
           port.friendlyName.toLowerCase().includes('pos') ||
           port.friendlyName.toLowerCase().includes('epson'));

        if (isBluetoothThermal || port.manufacturer) {
          printers.push({
            id: `serial_thermal_${port.path}`,
            name: `Thermal Printer (${port.path})`,
            displayName: port.friendlyName || `Thermal Printer (${port.path})`,
            description: `Serial thermal printer on ${port.path}`,
            status: 'available',
            type: 'thermal_bluetooth',
            path: port.path,
            vendorId: port.vendorId,
            productId: port.productId,
            manufacturer: port.manufacturer
          });
        }
      });
    } catch (error) {
      console.log('Error scanning serial ports:', error.message);
    }
  }

  addDemoPrinter(printers) {
    printers.push({
      id: 'mock_epson_thermal',
      name: 'EPSON TM-T20 (Demo)',
      displayName: 'EPSON TM-T20 Thermal Printer (Demo)',
      description: 'Mock EPSON thermal printer for demonstration',
      status: 'available',
      type: 'thermal_usb',
      isDemo: true
    });
  }

  async findPrinterById(printerId) {
    try {
      const printers = await this.getAllPrinters();
      return printers.find(p => p.id === printerId);
    } catch (error) {
      console.error('Error finding printer:', error);
      return null;
    }
  }

  async printReceipt(printerId, receiptData) {
    try {
      console.log('Printing receipt:', printerId, receiptData);

      return await this.printSystemPrinter(printerId, receiptData);
    } catch (error) {
      console.error('Printing error:', error);
      throw error;
    }
  }

  async printDemoReceipt(printer, receiptData) {
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Demo Receipt Print:');
    console.log('===================');
    console.log(`Title: ${receiptData.title}`);
    if (receiptData.image) {
      console.log('Image: Custom image attached');
    }
    console.log('Items:');
    receiptData.items?.forEach(item => {
      console.log(`  ${item.name}: ¥${item.price}`);
    });
    console.log(`Total: ¥${receiptData.total}`);
    console.log('===================');
    
    return { 
      success: true, 
      message: 'Demo receipt printed successfully! Check console for output.' 
    };
  }

  async printThermalReceiptSerial(printer, receiptData) {
    return new Promise((resolve) => {
      try {
        console.log(`Printing to thermal printer: ${printer.path}`);
        
        // Create thermal printer instance
        const thermalPrinter = new ThermalPrinter({
          type: PrinterTypes.EPSON,
          interface: printer.path,
          characterSet: CharacterSet.JAPAN,
          removeSpecialCharacters: false,
          lineCharacter: "=",
          options: {
            timeout: 5000,
            baudRate: 9600
          }
        });

        thermalPrinter.isPrinterConnected().then(async (isConnected) => {
          if (!isConnected) {
            resolve({ 
              success: false, 
              message: 'Cannot connect to thermal printer. Check connection and try again.' 
            });
            return;
          }

          try {
            // Clear any previous content
            thermalPrinter.clear();
            
            // Print logo image if exists
            await this.printImageToThermal(thermalPrinter, receiptData);
            
            // Print header
            thermalPrinter.alignCenter();
            thermalPrinter.setTextSize(2, 2);
            thermalPrinter.bold(true);
            thermalPrinter.println(receiptData.title || 'レシート');
            thermalPrinter.bold(false);
            thermalPrinter.setTextNormal();
            
            // Print separator
            thermalPrinter.drawLine();
            
            // Print items
            this.printItemsToThermal(thermalPrinter, receiptData.items);
            
            // Print separator
            thermalPrinter.drawLine();
            
            // Print total
            thermalPrinter.alignRight();
            thermalPrinter.bold(true);
            thermalPrinter.setTextSize(1, 2);
            thermalPrinter.println(`合計: ¥${receiptData.total || 0}`);
            thermalPrinter.bold(false);
            thermalPrinter.setTextNormal();
            
            // Print footer
            this.printFooterToThermal(thermalPrinter);
            
            // Execute print
            const result = await thermalPrinter.execute();
            console.log('Print result:', result);
            
            resolve({ 
              success: true, 
              message: 'Receipt printed successfully to thermal printer!' 
            });
            
          } catch (printError) {
            console.error('Print execution error:', printError);
            resolve({ 
              success: false, 
              message: `Printing failed: ${printError.message}` 
            });
          }
        }).catch(connectionError => {
          console.error('Connection error:', connectionError);
          resolve({ 
            success: false, 
            message: `Connection failed: ${connectionError.message}` 
          });
        });
        
      } catch (error) {
        console.error('Thermal printing setup error:', error);
        resolve({ 
          success: false, 
          message: `Thermal printing setup failed: ${error.message}` 
        });
      }
    });
  }

  async printImageToThermal(thermalPrinter, receiptData) {
    try {
      let imagePath = null;
      const tempImagePath = path.join(__dirname, '../../temp-receipt-image.png');
      
      if (receiptData.image) {
        // If image data is provided from React app
        const base64Data = receiptData.image.replace(/^data:image\/[a-z]+;base64,/, '');
        fs.writeFileSync(tempImagePath, base64Data, 'base64');
        imagePath = tempImagePath;
      } else {
        // Use default logo
        const logoPath = path.join(__dirname, '../assets/cafe-logo.svg');
        if (fs.existsSync(logoPath)) {
          imagePath = logoPath;
        }
      }
      
      if (imagePath) {
        // Resize image for thermal printer (57mm width ≈ 200-300 pixels)
        await Jimp.read(imagePath)
          .then(img => img.resize(200, Jimp.AUTO).quality(100))
          .then(img => img.writeAsync(tempImagePath));
        
        await thermalPrinter.printImage(tempImagePath);
        thermalPrinter.newLine();
        
        // Clean up temp file
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      }
    } catch (imageError) {
      console.log('Could not print image:', imageError.message);
      // Continue without image
    }
  }

  printItemsToThermal(thermalPrinter, items) {
    thermalPrinter.alignLeft();
    if (items && items.length > 0) {
      items.forEach(item => {
        const itemLine = `${item.name}`;
        const priceLine = `¥${item.price}`;
        
        // Print item name
        thermalPrinter.println(itemLine);
        // Print price aligned right
        thermalPrinter.alignRight();
        thermalPrinter.println(priceLine);
        thermalPrinter.alignLeft();
      });
    }
  }

  printFooterToThermal(thermalPrinter) {
    thermalPrinter.alignCenter();
    thermalPrinter.println('');
    thermalPrinter.println('ありがとうございました');
    thermalPrinter.println('');
    
    // Print date/time
    const now = new Date();
    const dateStr = now.toLocaleDateString('ja-JP');
    const timeStr = now.toLocaleTimeString('ja-JP');
    thermalPrinter.println(`${dateStr} ${timeStr}`);
    
    // Cut paper
    thermalPrinter.newLine();
    thermalPrinter.newLine();
    thermalPrinter.cut();
  }

  async printSystemPrinter(printerId, receiptHTML) {
    const { BrowserWindow } = require('electron');
    
    return new Promise((resolve) => {
      try {
        console.log(`Printing to system printer: ${printerId}`);
        
        // // Get image for printing
        // const imageBase64 = this.getImageForSystemPrint(receiptData);
        
        // // Create HTML content for printing
        // const receiptHTML = this.generateReceiptHTML(receiptData, imageBase64);

        // Create a new window for printing
        const printWindow = new BrowserWindow({
          width: 300,
          height: 600,
          show: false,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: true
          }
        });

        const dataPrintHTML = `
        <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <style>
                  @page {
                      size: 57mm auto;
                      margin: 0;
                  }
                  body {
                      font-family: 'Courier New', monospace;
                      font-size: 10px;
                      line-height: 1.2;
                      margin: 0;
                      padding: 2mm;
                      width: 53mm;
                      box-sizing: border-box;
                  }
                  .center { text-align: center; }
                  .right { text-align: right; }
                  .left { text-align: left; }
                  .bold { font-weight: bold; }
                  .large { font-size: 14px; }
                  .separator { border-top: 1px dashed #000; margin: 2px 0; }
                  .item-line { margin: 1px 0; font-size: 8px; }
                  .total { font-size: 10px; margin-top: 3px; }
                  .logo { width: 40mm; height: auto; margin: 2mm 0; }
                  .company-info { font-size: 8px; line-height: 1.2; }
                  .receipt-header { font-size: 10px; margin: 2px 0; }
              </style>
          </head>
          <body>
              <div class="center">              
                <img 
                  src="data:image/png;base64,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" 
                  alt="logo" 
                  width="56mm" 
                />
              </div>
              <div class="center bold large">マックメカニクスツールズ株式会社</div>
              <br>
              <div class="center receipt-header">納品書 兼 領収書</div>
              <div class="left">No: 1</div>
              <div class="left">納品日: 2025/09/25</div>
              <div class="left">1</div>
              <div class="left">API Test Company Ltd 様</div>
              <div class="separator"></div>
              
              <div class="item-line">
                  <div>1 M1222-00</div>
                  <div>3/8IN SOCKET, MAC DR</div>
                  <div class="right">1 x 2,352 = ¥2,352</div>
                </div>
              
              <div class="separator"></div>
              <div class="right">商品合計: ¥2,352</div>
              <div class="right">消費税(8%): ¥0</div>
              <div class="right bold total">合計: ¥2,352</div>
              
              <div class="separator"></div>
              <div class="left">前回残高: ¥0</div>
              <div class="left">ご入金額: ¥0</div>
              <div class="left">今回残高: ¥2,352</div>
              <div class="left">次回ご入金額: ¥0</div>
              
              <div class="separator"></div>
              <div class="center company-info">
                  <div>マックメカニクスツールズ株式会社</div>
                  <div>〒251-0861</div>
                  <div>神奈川県藤沢市大庭5224-6</div>
                  <div>TEL 0466-89-0375 FAX 0466-88-6802</div>
                  <div>登録番号: 1</div>
              </div>
          </body>
          </html>
        `;

        printWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(dataPrintHTML));
        
        printWindow.webContents.once('did-finish-load', () => {
          const printOptions = {
            silent: true,
            printBackground: true,
            deviceName: printerId,
            margins: {
              marginType: 'none'
            },
            scaleFactor: 100
          };

          printWindow.webContents.print(printOptions, (success, failureReason) => {
            printWindow.close();
            
            if (success) {
              resolve({ 
                success: true, 
                message: 'Receipt printed successfully to system printer!' 
              });
            } else {
              resolve({ 
                success: false, 
                message: `System printing failed: ${failureReason}` 
              });
            }
          });
        });

      } catch (error) {
        console.error('System printing error:', error);
        resolve({ 
          success: false, 
          message: `System printing failed: ${error.message}` 
        });
      }
    });
  }

  getImageForSystemPrint(receiptData) {
    try {
      if (receiptData.image) {
        // Use uploaded image
        return receiptData.image;
      } else {
        // Use default logo
        const logoPath = path.join(__dirname, '../assets/cafe-logo.svg');
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          return `data:image/svg+xml;base64,${logoBuffer.toString('base64')}`;
        }
      }
    } catch (error) {
      console.log('Could not read image:', error.message);
    }
    return '';
  }

  generateReceiptHTML(receiptData, imageBase64) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: 57mm auto;
            margin: 2mm;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 2mm;
            width: 53mm;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .large { font-size: 16px; }
        .separator { border-top: 1px dashed #000; margin: 3px 0; }
        .item { display: flex; justify-content: space-between; margin: 1px 0; }
        .total { font-size: 14px; margin-top: 5px; }
        .logo { width: 40mm; height: auto; margin: 2mm 0; }
    </style>
</head>
<body>
    ${imageBase64 ? `<div class="center"><img src="${imageBase64}" class="logo" alt="Logo"/></div>` : ''}
    <div class="center bold large">${receiptData.title || 'レシート'}</div>
    <div class="separator"></div>
    
    ${receiptData.items?.map(item => 
      `<div class="item">
        <span>${item.name}</span>
        <span>¥${item.price}</span>
       </div>`
    ).join('') || ''}
    
    <div class="separator"></div>
    <div class="right bold total">合計: ¥${receiptData.total || 0}</div>
    <br>
    <div class="center">ありがとうございました</div>
    <br>
    <div class="center">${new Date().toLocaleDateString('ja-JP')} ${new Date().toLocaleTimeString('ja-JP')}</div>
</body>
</html>`;
  }
}

module.exports = PrinterService;
