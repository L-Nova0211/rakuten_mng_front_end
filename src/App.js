import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import Home from './page/Home';
import Login from './page/Login';
import Navbar from './page/Navbar';
import Register from './page/Register';
// import Setting from './page/Setting';


const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

function App() {
  if(token === null || user === null){
    return (
      <BrowserRouter>
        <Routes>
          <Route path='' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='*' element={<Navigate to={''} />} />
        </Routes>
      </BrowserRouter>
    );
  }
  else{
    return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/home' element={<Home />} />
          {/* <Route path='/setting' element={<Setting />} /> */}
          <Route path='*' element={<Navigate to={'home'} />} />
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App;
