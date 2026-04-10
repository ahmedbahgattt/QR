import React, { useState, useEffect } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";

const GS1QRGenerator: React.FC = () => {
  const [gtin, setGtin] = useState("");
  const [showInput, setShowInput] = useState(true);
  const [batchNumber, setBatchNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  // Generate random batch number (6 alphanumeric characters)
  const generateBatchNumber = () => {
    const alphanumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += alphanumeric.charAt(
        Math.floor(Math.random() * alphanumeric.length)
      );
    }
    return result;
  };

  // Generate random serial number (11 numeric digits)
  const generateSerialNumber = () => {
    let result = "";
    for (let i = 0; i < 11; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  };

  // Calculate expiration date (2-5 years from now)
  const calculateExpirationDate = () => {
    const today = new Date();
    // Add random number of years between 2 and 5
    const yearsToAdd = Math.floor(Math.random() * 4) + 2; // 2 to 5 years
    const expiryDate = new Date(today);
    expiryDate.setFullYear(today.getFullYear() + yearsToAdd);

    // Format as YYMMDD
    const year = expiryDate.getFullYear().toString().slice(-2);
    const month = (expiryDate.getMonth() + 1).toString().padStart(2, "0");
    const day = expiryDate.getDate().toString().padStart(2, "0");

    return `${year}${month}${day}`;
  };

  // Validate GTIN input (6 digits)
  const validateGtin = (input: string) => {
    const regex = /^\d{0,6}$/;
    if (regex.test(input)) {
      setGtin(input);
      if (input.length === 6) {
        setShowInput(false);
      }
    }
  };

  // Generate GS1 data string with proper formatting for scanner compatibility
  const generateGS1Data = () => {
    const gs1Separator = "\x1d"; // Group Separator - proper GS1 delimiter for scanners
    // GS1-128 format: AI(01)GTIN + AI(17)ExpirationDate + AI(10)Batch + AI(21)SerialNumber
    const completeGtin = gtin.padStart(14, "0");
    return `${gs1Separator}01${completeGtin}${gs1Separator}17${expirationDate}${gs1Separator}10${batchNumber}${gs1Separator}21${serialNumber}`;
  };

  // Auto-update serial number every 0.5 seconds when QR is showing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!showInput && gtin.length === 6) {
      interval = setInterval(() => {
        setSerialNumber(generateSerialNumber());
        setBatchNumber(generateBatchNumber());
      }, 500);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showInput, gtin]);

  // Initialize serial number, batch number and expiration date
  useEffect(() => {
    setBatchNumber(generateBatchNumber());
    setSerialNumber(generateSerialNumber());
    setExpirationDate(calculateExpirationDate());
  }, []);

  // Update expiration date when resetting
  useEffect(() => {
    if (showInput) {
      setExpirationDate(calculateExpirationDate());
    }
  }, [showInput]);

  return (
    <div className="gs1-container">
      {showInput ? (
        <div className="input-container">
          <h1
            style={{
              color: "#e7ff4b",
              fontSize: "1.5rem",
              marginBottom: "20px",
            }}
          >
            Bahgat MDCN QR Generator
          </h1>
          <div className="input-group">
            <label className="input-label">Enter your code</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={gtin}
              onChange={(e) => validateGtin(e.target.value)}
              maxLength={6}
              autoFocus
              style={{ fontSize: "24px" }}
            />
          </div>
          <div className="wave-background" />
        </div>
      ) : (
        <div className="qr-container">
          {!showSizeSelector ? (
            <>
              <button
                onClick={() => setShowSizeSelector(true)}
                style={{
                  marginBottom: "20px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  backgroundColor: "#e7ff4b",
                  color: "#000",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Adjust QR Size
              </button>
            </>
          ) : (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "rgba(231, 255, 75, 0.1)",
                borderRadius: "8px",
                borderLeft: "4px solid #e7ff4b",
              }}
            >
              <label
                style={{
                  color: "#e7ff4b",
                  display: "block",
                  marginBottom: "10px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                QR Size: {qrSize}px
              </label>
              <input
                type="range"
                min="150"
                max="500"
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={() => setShowSizeSelector(false)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    fontSize: "12px",
                    backgroundColor: "#e7ff4b",
                    color: "#000",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
          <QRCode
            value={generateGS1Data()}
            size={qrSize}
            level="H"
            style={{ width: "70%", height: "auto" }}
            imageSettings={{
              src: "",
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
          <p
            style={{ color: "#e7ff4b", marginTop: "10px", fontSize: "0.8rem" }}
          >
            Bahgat MDCN QR Code
          </p>
          <button
            onClick={() => {
              setShowInput(true);
              setGtin("");
              setShowSizeSelector(false);
            }}
          >
            <span>Enter New Code</span>
          </button>
          <div className="wave-background" />
        </div>
      )}
    </div>
  );
};

export default GS1QRGenerator;
