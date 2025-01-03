import React, { useContext, useEffect, useState } from 'react';
import PageHeader from '../navbar/PageHeader';
import ChallengeButton from '../ChallengeButtons/buttons';
import Modal from '../modal/modal';
import SocketContext from "../../../context/SocketContext";

const UserChallengePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [updatedValue, setUpdatedValue] = useState(0);
  const [solvedChallenges, setSolvedChallenges] = useState([]); // New state
  const [solvedChallengesData, setSolvedChallengesData] = useState([]); // New state
  const [totalAttempts, setTotalAttempts] = useState(0);
  const { socket, challenges, fetchChallenges } = useContext(SocketContext);
  
  const apiUrl = import.meta.env.VITE_Backend_URL;

  useEffect(() => {
    fetchChallenges();
    fetchSolvedChallenges();
  }, []);

  const fetchSolvedChallenges = async () => {
    try {

      const response = await fetch(`${apiUrl}/api/challenges/solved`, {
        headers: {
          'Content-Type': 'application/json',
          'Auth-token': localStorage.getItem('Hactify-Auth-token')
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      setSolvedChallenges(data.map(solved => solved.challengeId));
      setSolvedChallengesData(data);
    } catch (error) {
      console.error('Error fetching solved challenges:', error);
    }
  };

  // const handleButtonClick = (challenge) => {
  //   setSelectedChallenge(challenge);
  //   setIsModalOpen(true);
  //   setUpdatedValue(challenge.value);
  //   setTotalAttempts(challenge.max_attempts);

    
  // };

  const handleButtonClick = async (challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
    setUpdatedValue(challenge.value);
    setTotalAttempts(challenge.max_attempts);
  
    try {
      // Fetch the number of attempts for the selected challenge
      const response = await fetch(`${apiUrl}/api/challenges/attempts/${challenge._id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Auth-token': localStorage.getItem('Hactify-Auth-token')
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      setAttempts(data.attempts); // Set the fetched attempt count
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };
  
  

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChallenge(null);
    setAnswer('');
    setAttempts(0);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (selectedChallenge.type === 'manual_verification') {
      setFeedback('Your response is submitted for Review!');
    } else if (selectedChallenge.type === 'code' || selectedChallenge.type === 'standard' || selectedChallenge.type === 'multiple_choice' || selectedChallenge.type === 'dynamic') {
      try {

        const response = await fetch(`${apiUrl}/api/challenges/verify-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Auth-token': localStorage.getItem('Hactify-Auth-token')
          },
          body: JSON.stringify({
            challengeId: selectedChallenge._id,
            answer,
            updatedValue,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.correct) {
          setFeedback('Correct answer!');
          setSolvedChallenges(prevSolved => [...prevSolved, selectedChallenge._id]); // Update solved challenges state
          setTimeout(closeModal, 2000); // Close the modal after a delay
          socket.emit("challengeSolved", {});
          fetchSolvedChallenges();
        } else {
          setAttempts(prev => prev + 1);
          if (selectedChallenge.max_attempts !== 0 && attempts + 1 >= selectedChallenge.max_attempts) {
            setFeedback('No more attempts left');
            setTimeout(closeModal, 2000); // Close the modal after a delay
          } else {
            setFeedback('Wrong answer, try again.');
          }
        }
      } catch (error) {
        console.error('Error verifying answer:', error);
        setFeedback('Error verifying answer');
      }
    }
  };


  const groupByCategory = (challenges) => {
    return challenges.reduce((acc, challenge) => {
      if (!acc[challenge.category]) {
        acc[challenge.category] = [];
      }
      acc[challenge.category].push(challenge);
      return acc;
    }, {});
  };

  const groupedChallenges = groupByCategory(challenges);
 

  return (
    <>
      <PageHeader pageTitle="Challenges" />
      <div className="container mx-auto p-4">
        {Object.keys(groupedChallenges).map((category, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedChallenges[category].map((challenge, index) => {
              // Find the solved challenge by matching challengeId
              const solvedChallenge = solvedChallengesData.find(
                (solved) => solved.challengeId === challenge._id
              );

              const isSolved = !!solvedChallenge; // Boolean to check if solved
              const points = isSolved ? solvedChallenge.points : 0; // Get points if solved

              return (
                <ChallengeButton
                  key={index}
                  challenge={challenge}
                  onClick={handleButtonClick}
                  solved={isSolved}
                  assignedPoints={points} // Pass points to the ChallengeButton
                />
              );
            })}
            </div>
          </div>
        ))}
      </div>
      {selectedChallenge && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          challenge={selectedChallenge}
          answer={answer}
          setAnswer={setAnswer}
          handleSubmit={handleSubmit}
          attempts={attempts}
          feedback={feedback}
          updatedValue={updatedValue}
          setUpdatedValue={setUpdatedValue}
          solvedChallenges={solvedChallenges} // Pass solved challenges
          totalAttempts={totalAttempts}
        />
      )}
    </>
  );
};

export default UserChallengePage;
