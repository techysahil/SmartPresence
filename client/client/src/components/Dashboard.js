

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import AttendanceRecords from './AttendanceRecords';

const Dashboard = () => {
  const navigate = useNavigate();
  const [teachingDetails, setTeachingDetails] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classroomNumber, setClassroomNumber] = useState('');
  const [qrData, setQrData] = useState(null);
  const [validityDuration, setValidityDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(null);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [showRecords, setShowRecords] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [filteredView, setFilteredView] = useState(false);
  const [qrExpired, setQrExpired] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const qrCodeRef = useRef(null);
  

  useEffect(() => {
    const fetchTeachingDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('No token found. Please log in again.');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:4200/user/teaching-details', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTeachingDetails(response.data);
      } catch (error) {
        console.error('Error fetching teaching details:', error);
        toast.error('Failed to fetch teaching details');
      }
    };

    fetchTeachingDetails();
  }, [navigate]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.querySelector('.qr-code');
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen(); 
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleTakeAttendance = async () => {
    try {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + validityDuration);

      const qrPayload = {
        year: selectedYear,
        branch: selectedBranch,
        division: selectedDivision,
        subject: selectedSubject,
        classroomNumber,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        expiration: expirationTime.getTime()
      };

      setQrData(qrPayload);
      setQrExpired(false);
      startTimer(expirationTime);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4200/attendance/create-record',
        {
          year: selectedYear,
          branch: selectedBranch,
          division: selectedDivision,
          subject: selectedSubject
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAttendanceRecord(response.data.record);
      setExcelFile(response.data.excelFile);
      toast.success('Attendance record created/updated successfully');
    } catch (error) {
      console.error('Error creating attendance record:', error);
      toast.error('Failed to create/update attendance record');
    }
  };

  const startTimer = (expirationTime) => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = Math.floor((expirationTime - now) / 1000);

      if (timeDiff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setQrData(null); // This makes the QR code disappear
        setQrExpired(true);
        toast.error('QR code has expired!');
      } else {
        setTimeLeft(timeDiff);
      }
    }, 1000);
  };

  const downloadExcel = () => {
    if (!excelFile) return;

    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelFile}`;
    link.download = `attendance_${selectedYear}_${selectedBranch}_${selectedDivision}_${selectedSubject}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetSelection = () => {
    setSelectedYear('');
    setSelectedBranch('');
    setSelectedDivision('');
    setSelectedSubject('');
    setClassroomNumber('');
    setQrData(null);
    setTimeLeft(null);
    setAttendanceRecord(null);
    setExcelFile(null);
    setShowRecords(false);
    setQrExpired(false);
  };

  if (showRecords) {
    return (
      <div className="dashboard">
        <button onClick={() => setShowRecords(false)}>Back to Dashboard</button>
        <AttendanceRecords
          year={filteredView ? selectedYear : null}
          branch={filteredView ? selectedBranch : null}
          division={filteredView ? selectedDivision : null}
          subject={filteredView ? selectedSubject : null}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Teacher's Dashboard</h1>
      <div className="take-attendance">
        <h2>Take Attendance</h2>

        {/* Class selection UI remains the same */}
        {!selectedYear && (
          <div>
            <h3>Select Year</h3>
            {teachingDetails.map((detail, i) => (
              <button key={i} onClick={() => setSelectedYear(detail.year)}>{detail.year}</button>
            ))}
          </div>
        )}

        {selectedYear && !selectedBranch && (
          <div>
            <h3>Select Branch</h3>
            {Array.from(new Set(
              teachingDetails.filter(d => d.year === selectedYear).flatMap(d => d.branch))
            ).map((branch, i) => (
              <button key={i} onClick={() => setSelectedBranch(branch)}>{branch}</button>
            ))}
          </div>
        )}

        {selectedBranch && !selectedDivision && (
          <div>
            <h3>Select Division</h3>
            {teachingDetails
              .find(d => d.year === selectedYear && d.branch.includes(selectedBranch))
              ?.division.map((div, i) => (
                <button key={i} onClick={() => setSelectedDivision(div)}>{div}</button>
              ))}
          </div>
        )}

        {selectedDivision && !selectedSubject && (
          <div>
            <h3>Select Subject</h3>
            {teachingDetails
              .find(d => d.year === selectedYear && d.branch.includes(selectedBranch))
              ?.subjects.map((sub, i) => (
                <button key={i} onClick={() => setSelectedSubject(sub)}>{sub}</button>
              ))}
          </div>
        )}

        {selectedSubject && (
          <div>
            <h3>Enter Classroom Number</h3>
            <input
              type="text"
              placeholder="Classroom Number"
              value={classroomNumber}
              onChange={(e) => setClassroomNumber(e.target.value)}
            />
            <h3>Set QR Code Validity (in minutes)</h3>
            <input
              type="number"
              min="1"
              value={validityDuration}
              onChange={(e) => setValidityDuration(Number(e.target.value))}
            />
            <button onClick={handleTakeAttendance}>Generate QR Code</button>
            <button onClick={resetSelection}>Reset</button>
            <div className="action-buttons">
            <button 
             onClick={() => {
             setFilteredView(true);
            setShowRecords(true);
            }}
            >
            View Previous Attendance
          </button>
          {excelFile && (
          <button onClick={downloadExcel}>
          Download Attendance Sheet
          </button>
          )}
        </div>
        </div>
        )}

        {/* QR Code and Buttons Section */}
        {qrData && !qrExpired && (
          <div className="qr-code-cont" style={{ position: 'relative', display: 'inline-block' }}>
            <h3>Generated QR Code</h3>
            <div className="qr-code" id="qr-code">
              {/* <h3>Generated QR Code</h3> */}
              <QRCode value={JSON.stringify(qrData)} size={256} />
            </div>

            <button 
                onClick={toggleFullscreen}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(200, 10, 10, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
                title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
              >
                {isFullscreen ? '✕' : '⛶'}
              </button>
            
            <div className="timer-container">
              <div className="timer">
                Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <button 
                className="view-enrolled-btn"
                onClick={() => {
                  setFilteredView(true);
                  setShowRecords(true);
                }}
              >
                View Enrolled Students
              </button>
            </div>
          </div>
        )}

  
      </div>
    </div>
  );
};

export default Dashboard;