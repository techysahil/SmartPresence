import React, { useState } from 'react';
import axios from 'axios';
import '../components/style.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {


  

 
  const[emailId, setEmail] = useState('');
  const[password, setPassword] = useState('');
  const[isLoading, setLoading] = useState(false);


  const navigate = useNavigate();

  const submitHandler = (event) => {
    event.preventDefault();
    setLoading(true);
    axios.post('http://localhost:4200/user/login', {
      email: emailId,
      password: password
    })
    .then(response => {
      setLoading(false);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard')
      console.log('Signup Successful:', response);
    })
    .catch(error => {
      setLoading(false); 
      toast.error("Something went wrong....");
      console.error('Signup Failed:', error);
    });

    

  };
  

  return (
    <div className="signup-wrapper1">
      <div className="signup-box1">
        <div className="signup-left1">
          <img className="signup-left-logo1" alt="logo" src={require('../assets/logo.png')} />
          <h1 className="signup-left-heading1">Ramrao Adik Institute Of Technology</h1>
          <p className="signup-left-para1">QR Based Attendance System</p>
        </div>

        <div className="signup-right1">
          {/* //<h1 class="heading1">Login With Your Account</h1> */}
          <hr />
          <form onSubmit={submitHandler}>
          <div class="signup-pd1">
            <h1>Login With Your Account</h1>
          <input required onChange={e=>{setEmail(e.target.value)}} type="email" placeholder="College Email-Id" />
          <input required onChange={e=>{setPassword(e.target.value)}} placeholder="Password" type="password" />
          
          
          
          
          </div>

          <div class="buttonCont">
          <button className="registerbtn" type='submit'>{isLoading && <i className="fa-solid fa-spinner spinner"></i>}Login</button>
          </div>
          <p className="login-link">
            Don't have an account? <span onClick={() => navigate('/Signup')}>Sign Up</span>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
