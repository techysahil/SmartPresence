


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttendanceRecords = ({ year, branch, division, subject }) => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New states for icon functionality
  const [deleteMode, setDeleteMode] = useState(false);
  // const [selectedRows, setSelectedRows] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [lastAction, setLastAction] = useState(null);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4200/attendance/records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const intervalId = setInterval(fetchRecords, 10000);
    return () => clearInterval(intervalId);
  }, [year, branch, division, subject]);

  // Icon handler functions
  const handleReload = async () => {
    try {
      await fetchRecords();
      toast.success('Attendance sheet refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
    }
  };

  const handleDeleteItems = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:4200/attendance/delete-items',
        { 
          recordId,
          // studentIds: selectedRows,
          dateKeys: selectedDates 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Selected items deleted');
      setLastAction({
        type: 'delete',
        recordId,
        data: {
          // students: records.find(r => r._id === recordId).students
          //   .filter(s => selectedRows.includes(s._id)),
          dates: selectedDates
        }
      });
      // setSelectedRows([]);
      setSelectedDates([]);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete items');
    }
  };


  const handleDeleteMode = (recordId) => {
    if (deleteMode && selectedDates.length > 0) {
      const confirm = window.confirm(
        `Delete ${selectedDates.length} date column(s)?`
      );
      if (confirm) {
        // Here you would call your delete API
        handleDeleteItems(recordId);
      }
    }
    setDeleteMode(!deleteMode);
  };



  const handleDateSelect = (date, isChecked) => {
    setSelectedDates(prev =>
      isChecked
        ? [...prev, date]
        : prev.filter(d => d !== date))
  };

  const handleUndo = async () => {
    if (!lastAction) {
      toast.warning('Nothing to undo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4200/attendance/undo-action',
        {
          recordId: lastAction.recordId,
          actionType: lastAction.type,
          originalData: lastAction.data
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Action undone successfully');
      setLastAction(null);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to undo action');
    }
  };

  const handleReset = async (recordId) => {
    const confirm = window.confirm(
      'This will clear ALL attendance data (keeping student info). Continue?'
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:4200/attendance/reset-attendance',
        { recordId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Attendance sheet reset');
      setLastAction({
        type: 'reset',
        recordId,
        data: response.data.originalData
      });
      fetchRecords();
    } catch (error) {
      toast.error('Failed to reset attendance');
    }
  };

  // Table styles
  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  };

  const cellStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left',
    minWidth: '100px'
  };

  const headerCellStyle = {
    ...cellStyle,
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0
  };

  const filteredRecords = records.filter(record => {
    if (year && record.year !== year) return false;
    if (branch && record.branch !== branch) return false;
    if (division && record.division !== division) return false;
    if (subject && record.subject !== subject) return false;
    
    if (!record.students) return false;
    
    return record.students.some(student => {
      const name = student.name || '';
      const rollNo = student.rollNo || '';
      const subject = record.subject || '';
      
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Loading attendance records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Attendance Records</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name, roll no, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            width: '300px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
      </div>
      
      {filteredRecords.length > 0 ? (
        filteredRecords.map(record => {
          const sortedDates = [...(record.attendanceDates || [])].sort((a, b) => new Date(a) - new Date(b));
          
          return (
            <div key={record._id} style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  {record.subject} - {record.year} {record.branch} {record.division}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleReload}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    title="Reload"
                  >
                    🔄
                  </button>
                  <button 
                     onClick={() => handleDeleteMode(record._id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '16px',
                      color: deleteMode ? 'red' : 'inherit'
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                  <button 
                    onClick={handleUndo}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    title="Undo"
                  >
                    ↩️
                  </button>
                  <button 
                    onClick={() => handleReset(record._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    title="Reset"
                  >
                    🔄
                  </button>
                </div>
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {deleteMode && <th style={headerCellStyle}>Select</th>}
                      <th style={headerCellStyle}>Sr. No.</th>
                      <th style={headerCellStyle}>Roll No.</th>
                      <th style={headerCellStyle}>Name</th>
                      {sortedDates.map(date => (
                        <th key={date} style={headerCellStyle}>
                          {new Date(date).toLocaleDateString()}
                          {deleteMode && (
                            <div style={{ marginTop: '5px' }}>
                              <input
                                type="checkbox"
                                onChange={(e) => handleDateSelect(date, e.target.checked)}
                              />
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                  {record.students?.map((student, index) => (
                      <tr key={student._id || index}>
                        <td style={cellStyle}>{index + 1}</td>
                        <td style={cellStyle}>{student.rollNo}</td>
                        <td style={cellStyle}>{student.name}</td>
                        {sortedDates.map(date => {
                          const dateKey = new Date(date).toISOString().split('T')[0];
                          let status = '';
                          if (student.attendanceDates instanceof Map) {
                            status = student.attendanceDates.get(dateKey);
                          } else if (typeof student.attendanceDates === 'object') {
                            status = student.attendanceDates[dateKey];
                          }
                          return (
                            <td key={date} style={cellStyle}>
                              {status === 'present' ? (
                                <span style={{ color: 'green' }}>✅ Present</span>
                              ) : status === 'absent' ? (
                                <span style={{ color: 'red' }}>❌ Absent</span>
                              ) : (
                                <span style={{ color: '#666' }}>-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}>
          {searchTerm ? (
            <p>No records found matching "{searchTerm}"</p>
          ) : (
            <p>No attendance records available</p>
          )}
        </div>
      )}
    </div>
  );
};


export default AttendanceRecords;