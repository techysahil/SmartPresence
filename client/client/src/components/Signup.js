

import React, { useState } from 'react';
import axios from 'axios';
import '../components/style.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [teachingDetails, setTeachingDetails] = useState([
    { year: '', branch: '', division: '', subjects: [] }
  ]);

  const handleInputChange = (index, field, value) => {
    const updatedDetails = [...teachingDetails];

    if (field === 'numSubjects') {
      const numSubjects = parseInt(value, 10);
      if (!isNaN(numSubjects)) {
        updatedDetails[index].subjects = Array(numSubjects).fill('');
      }
    } else {
      updatedDetails[index][field] = value;
    }

    setTeachingDetails(updatedDetails);
  };

  const handleSubjectChange = (index, subjectIndex, value) => {
    const updatedDetails = [...teachingDetails];
    updatedDetails[index].subjects[subjectIndex] = value;
    setTeachingDetails(updatedDetails);
  };

  const handleAddRow = () => {
    setTeachingDetails([
      ...teachingDetails,
      { year: '', branch: '', division: '', subjects: [] }
    ]);
  };

  const handleDeleteRow = (index) => {
    const updatedDetails = [...teachingDetails];
    updatedDetails.splice(index, 1);
    setTeachingDetails(updatedDetails);
  };

  const [FullName, setfullName] = useState('');
  const [emailId, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('fullName', FullName);
    formData.append('email', emailId);
    formData.append('password', password);
    formData.append('phone', phone);
    if (image) {
      formData.append('image', image);
    }
    formData.append('teachingDetails', JSON.stringify(teachingDetails));

    axios.post('http://localhost:4200/user/signup', formData)
      .then(response => {
        setLoading(false);
        toast.success('Your account has been Created Successfully...');
        navigate('/login');
      })
      .catch(error => {
        setLoading(false);
        toast.error("Something went wrong....");
        console.error('Signup Failed:', error);
      });
  };

  const fileHandler = (e) => {
    setImage(e.target.files[0]);
    setImageUrl(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-box">
        <div className="signup-left">
          <img className="signup-left-logo" alt="logo" src={require('../assets/logo.png')} />
          <h1 className="signup-left-heading">Ramrao Adik Institute Of Technology</h1>
          <p className="signup-left-para">QR Based Attendance System</p>
        </div>

        <div className="signup-right">
          <h1 className="heading1">Create Your Account</h1>
          <hr />
          <form onSubmit={submitHandler}>
            <div className="signup-pd">
              <h2>Enter Personal Details</h2>
              {imageUrl && <img className="your-dp" alt="Your Display Picture" src={imageUrl} />}
              <input required onChange={e => setfullName(e.target.value)} type="text" placeholder="Full Name" />
              <input required onChange={e => setEmail(e.target.value)} type="email" placeholder="College Email-Id" />
              <input required onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
              <input required onChange={e => setPhone(e.target.value)} type="text" placeholder="Phone Number" />
              <input required onChange={fileHandler} type="file" />
            </div>

            <h2>Teaching Details</h2>
            {teachingDetails.map((detail, index) => (
              <div key={index} className="teaching-row">
                <select
                  required
                  value={detail.year}
                  onChange={(e) => handleInputChange(index, 'year', e.target.value)}
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>

                <input
                  required
                  placeholder="Branch"
                  value={detail.branch}
                  onChange={(e) => handleInputChange(index, 'branch', e.target.value)}
                />

                <input
                  required
                  placeholder="Division"
                  value={detail.division}
                  onChange={(e) => handleInputChange(index, 'division', e.target.value)}
                />

                <input
                  required
                  type="number"
                  placeholder="Number of Subjects"
                  min="1"
                  onChange={(e) => handleInputChange(index, 'numSubjects', e.target.value)}
                />

                {detail.subjects.map((subject, subjectIndex) => (
                  <input
                    required
                    key={subjectIndex}
                    placeholder={`Subject ${subjectIndex + 1}`}
                    value={subject}
                    onChange={(e) => handleSubjectChange(index, subjectIndex, e.target.value)}
                  />
                ))}

                {teachingDetails.length > 1 && (
                  <button
                    type="button"
                    title="Delete This Year"
                    onClick={() => handleDeleteRow(index)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'red',
                      fontSize: '18px',
                      marginLeft: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            ))}

            <div style={{ marginTop: '10px' }}>
              <button type="button" onClick={handleAddRow}>
                Add Another Year
              </button>
            </div>

            <div className="buttonCont">
              <button className="registerbtn" type="submit">
                {isLoading && <i className="fa-solid fa-spinner spinner"></i>}Register
              </button>
            </div>

            <p className="login-link">
              Already have an account? <span onClick={() => navigate('/login')}>Log in</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
