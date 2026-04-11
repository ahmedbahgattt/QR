import React, { useState, useEffect, useRef } from "react";
import bwipjs from "bwip-js/browser";

const GS1QRGenerator: React.FC = () => {
  const [gtin, setGtin] = useState("");
  const [showInput, setShowInput] = useState(true);
  const [batchNumber, setBatchNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate random batch number (6 alphanumeric characters)
  const generateBatchNumber = () => {
    const alphanumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += alphanumeric.charAt(
        Math.floor(Math.random() * alphanumeric.length),
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

  const calculateGtinCheckDigit = (digits13: string) => {
    const reversedDigits = digits13.split("").reverse();
    const sum = reversedDigits.reduce((acc, digit, index) => {
      const value = parseInt(digit, 10);
      const weight = index % 2 === 0 ? 3 : 1;
      return acc + value * weight;
    }, 0);
    return ((10 - (sum % 10)) % 10).toString();
  };

  const formatGtin14 = (input: string) => {
    const padded = input.padStart(13, "0");
    const checkDigit = calculateGtinCheckDigit(padded);
    return `${padded}${checkDigit}`;
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

  // Generate GS1 data string with a literal # delimiter so scanners read it as text
  const generateGS1Data = () => {
    const gtin14 = formatGtin14(gtin);
    return `01${gtin14}21${serialNumber}#17${expirationDate}10${batchNumber}`;
  };

  const renderBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    try {
      const scale = Math.max(2, Math.round(qrSize / 60));
      bwipjs.toCanvas(canvas, {
        bcid: "datamatrix",
        text: generateGS1Data(),
        scale,
        height: 20,
        width: 20,
        parse: true,
        parsefnc: false,
        gs1: false,
      } as any);
    } catch (error) {
      console.error("bwip-js render error:", error);
    }
  };

  useEffect(() => {
    if (!showInput && gtin.length === 6) {
      renderBarcode();
    }
  }, [showInput, gtin, serialNumber, expirationDate, batchNumber, qrSize]);

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
    <div
      className="gs1-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#000000",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {showInput ? (
        <div
          className="input-container"
          style={{ width: "100%", padding: "20px", textAlign: "center" }}
        >
          <h1
            style={{
              color: "#e7ff4b",
              fontSize: "1.5rem",
              marginBottom: "20px",
            }}
          >
            Bahgat MDCN QR Generator
          </h1>
          <div
            className="input-group"
            style={{
              backgroundColor: "#1c1c1e",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <label
              className="input-label"
              style={{
                color: "#e7ff4b",
                fontSize: "14px",
                marginBottom: "8px",
                textAlign: "left",
                display: "block",
              }}
            >
              Enter your code ({gtin.length}/6)
            </label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={gtin}
              onChange={(e) => validateGtin(e.target.value)}
              maxLength={6}
              autoFocus
              style={{
                fontSize: "24px",
                backgroundColor: "#1c1c1e",
                border: "1px solid #e7ff4b",
                color: "white",
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
              }}
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
                  position: "relative",
                  width: "auto",
                  display: "block",
                  left: "auto",
                  bottom: "auto",
                  transform: "none",
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <label
                  style={{
                    color: "#e7ff4b",
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  QR Size: {qrSize}px
                </label>
                <button
                  onClick={() => setShowSizeSelector(false)}
                  style={{
                    background: "transparent",
                    border: "2px solid #e7ff4b",
                    color: "#e7ff4b",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                  }}
                  title="Close"
                >
                  ✕
                </button>
              </div>
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
            </div>
          )}
          <canvas
            ref={canvasRef}
            style={{ width: "70%", height: "auto", backgroundColor: "white" }}
          />
          <p
            style={{ color: "#e7ff4b", marginTop: "10px", fontSize: "0.8rem" }}
          >
            Bahgat MDCN GS1 DataMatrix
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
