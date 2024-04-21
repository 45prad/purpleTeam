import { useState, useEffect } from 'react'
// import './App.css'
import SideNavbar from './SideNavbar'

import {
  Route,
  Routes,
  useNavigate,
  BrowserRouter as Router
} from "react-router-dom"
import { AddUsers, AssignTeams, Report, ScoresComponent, UserHomePage, UserDetails,AdminDataVisualization } from './index'
import { Alert, Home } from './Notes';
import ChatMainPage from './Chats/ChatMainPage'


function HomePage() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type)=>{
      setAlert({
        msg: message,
        type: type
      })
      setTimeout(() => {
          setAlert(null);
      }, 1500);
  }

    useEffect(() => {
        const authToken = localStorage.getItem('Hactify-Auth-token');
        if (!authToken) {
            navigate('/signin');
        }
    }, []);

  return (
    <>
      {/* <Router> */}
        <div className="flex flex-row  h-screen">
          <div className="left_Home w-[5%] min-w-20">
            <SideNavbar />
          </div>
          <div className="right_Home lg:w-[95%] h-screen">
            {/* <Alert alert={alert}/> */}
            <Routes>
              <Route exact path='/' element={<ScoresComponent/>} />
              <Route exact path='/home' element={<AdminDataVisualization/>} />
              <Route exact path='/createuser' element={<AddUsers />} />
              <Route exact path='/assignTeams' element={<AssignTeams />} />
              <Route exact path='/scores' element={<ScoresComponent />} />
              <Route exact path='/UserHome' element={<UserHomePage />} />
              <Route exact path='/UserHome/report/SITREP' element={<Report />} />
              <Route exact path='/UserHome/report/incident' element={<Report />} />
              <Route exact path='/UserHome/report/day-end' element={<Report />} />
              <Route exact path="/user/:userId" element={<UserDetails/>} />
              <Route exact path="/notes" element={<Home showAlert={showAlert}/>}/>
              <Route exact path="/chat" element={<ChatMainPage/>}/>
            </Routes>
          </div>
        </div>
      {/* </Router> */}
    </>
  )
}

export default HomePage
