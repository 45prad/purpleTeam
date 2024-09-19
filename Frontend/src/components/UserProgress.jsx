
import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from '../context/AuthContext';
import UserReports from "./UserReports";

import SubmissionTable from './Challenges/Submissions/submission';
import ReportDataVisualization from './DataVisualization/reportDataVisualization';
import ChallengesDataVisualization from './DataVisualization/challengesDataVisualization';

function UserProgress() {
    const apiUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();
    const context = useContext(AuthContext);
    const { user, fetchUserRole } = context;
    const[mode,setMode]=useState("purpleTeam");
    const [submissionData, setSubmissionData]=useState(null);
    const [submissionTypes, setSubmissionTypes]=useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [scoreData, setScoreData] = useState(null);
    const [selectedTab, setSelectedTab] = useState('reports'); // New state for tab selection


    useEffect(() => {
        const getUserRole = async () => {
            try {
                await fetchUserRole();
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        getUserRole();
    }, []);

    useEffect(() => {
        if (user._id) {
            // Fetch JSON data from API
            fetch(`${apiUrl}/api/responses/all/${user._id}`)
                .then(response => response.json())
                .then(data => setJsonData(data))
                .catch(error => console.error('Error fetching reports data:', error));

            // Fetch score data from API
            fetch(`${apiUrl}/api/score/score/${user._id}`)
                .then(response => response.json())
                .then(data => setScoreData(data))
                .catch(error => console.error('Error fetching score data:', error));

              fetch(`${apiUrl}/api/config/mode`)
              .then(response=>response.json())
              .then(data=>setMode(data.mode))
              .catch(error => console.error('Error fetching score data:', error));

              fetch(`${apiUrl}/api/submissions/userSubmissions/${user._id}`)
    .then(response => response.json())
    .then(data => {
      setSubmissionData(data);
    })
    .catch(error => {
      console.error('Error fetching submissions data:', error);
    });

    fetch(`${apiUrl}/api/submissions/types-count/${user._id}`)
    .then(response => response.json())
    .then(data => {
      setSubmissionTypes(data);
    })
    .catch(error => {
      console.error('Error fetching submission types count:', error);
    });
                      
        
        }
    }, [user._id]);

   
   

    // Render the component if user is authenticated and has required role
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Progress</h1>
            {user._id ? (
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className='flex flex-row'>
                        <div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                                <p className="text-gray-700">{user.name}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                                <p className="text-gray-700">{user.email}</p>
                            </div>
                        </div>
                    </div>

 {/* Show challenges content directly if mode is 'ctfd' */}
 {mode === 'ctfd' ? (
            <>
              <ChallengesDataVisualization submissionData={submissionData} submissionTypes={submissionTypes} />
              <h1 className="text-3xl font-bold mb-4">Challenges Submissions</h1>
              <SubmissionTable userId={user._id} />
            </>
          ) : (
            <>
              {/* Buttons for switching between Reports and Challenges */}
              <div className="flex justify-center space-x-4 my-6">
                <button
                  onClick={() => setSelectedTab('reports')}
                  className={`px-4 py-2 mr-2 ${selectedTab === 'reports' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Reports
                </button>
                <button
                  onClick={() => setSelectedTab('challenges')}
                  className={`px-4 py-2 ${selectedTab === 'challenges' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Challenges
                </button>
              </div>

              {/* Conditional rendering based on selected tab */}
              {selectedTab === 'reports' && (
                <>
                  <ReportDataVisualization jsonData={jsonData} scoreData={scoreData} />
                  <UserReports userId={user._id} route="progress" />
                </>
              )}

              {selectedTab === 'challenges' && (
                <>
                  <ChallengesDataVisualization submissionData={submissionData} submissionTypes={submissionTypes} />
                  <h1 className="text-3xl font-bold mb-4">Challenges Submissions</h1>
                  <SubmissionTable userId={user._id} />
                </>
              )}
            </>
          )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default UserProgress;


