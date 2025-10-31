import React, { useState, useEffect } from 'react';
import PrinterList from './components/PrinterList';
import ReceiptForm from './components/ReceiptForm';
import './index.css';

const { ipcRenderer } = window.require('electron');

function App() {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const printerList = await ipcRenderer.invoke('get-printers');
      setPrinters(printerList);
      setStatus({ message: `Found ${printerList.length} printers`, type: 'success' });
    } catch (error) {
      console.error('Error loading printers:', error);
      setStatus({ message: `Error loading printers: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = async (receiptData) => {
    if (!selectedPrinter) {
      setStatus({ message: 'Please select a printer first', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const result = await ipcRenderer.invoke('print-receipt', {
        printerId: selectedPrinter.id,
        receiptData: `<!DOCTYPE html>
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
        .logo { width: 35mm; height: auto; margin: 1mm 0; }
        .company-info { font-size: 8px; line-height: 1.2; }
        .receipt-header { font-size: 10px; margin: 2px 0; }
    </style>
</head>
<body>
    <div class="center bold large">マックメカニクスツールズ株式会社</div>
    <br>
    <div class="center receipt-header">納品書 兼 領収書</div>
    <div class="left">No: 1</div>
    <div class="left">納品日: 2025/09/25</div>
    <div class="left">1</div>
    <div class="left">API Test Company Ltd 様</div>
    <div class="separator"></div>
    
    <div class="item-line">
        <div>1 BODM22224R</div>
        <div>22X24MM DP OFST BOX</div>
        <div class="right">1 x 10,741 = ¥10,741</div>
       </div>
    
    <div class="separator"></div>
    <div class="right">商品合計: ¥10,741</div>
    <div class="right">消費税(8%): ¥0</div>
    <div class="right bold total">合計: ¥10,741</div>
    
    <div class="separator"></div>
    <div class="left">前回残高: ¥0</div>
    <div class="left">ご入金額: ¥0</div>
    <div class="left">今回残高: ¥10,741</div>
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
</html>`
      });
      
      if (result.success) {
        setStatus({ message: 'Receipt printed successfully!', type: 'success' });
      } else {
        setStatus({ message: `Printing failed: ${result.message}`, type: 'error' });
      }
    } catch (error) {
      console.error('Printing error:', error);
      setStatus({ message: `Printing error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Thermal Printer Demo</h1>
        <p>Manage thermal printers and print receipts with Japanese text support</p>
      </div>

      <div className="main-content">
        <PrinterList
          printers={printers}
          selectedPrinter={selectedPrinter}
          onSelectPrinter={setSelectedPrinter}
          onRefresh={loadPrinters}
          loading={loading}
        />

        <ReceiptForm
          selectedPrinter={selectedPrinter}
          onPrint={handlePrintReceipt}
          loading={loading}
        />
      </div>

      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default App;
