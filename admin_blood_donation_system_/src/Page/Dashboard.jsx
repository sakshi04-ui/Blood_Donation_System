import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { FiActivity, FiDroplet, FiClock, FiCheckCircle, FiUser, FiSearch } from 'react-icons/fi';
import { MdOutlineBloodtype, MdOutlineLocalHospital } from 'react-icons/md';
import { BsGraphUp } from 'react-icons/bs';

const Dashboard = () => {
  const [rawBloodRequests, setRawBloodRequests] = useState([]);
  const [rawDonors, setRawDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllData, setShowAllData] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  // Fetch raw data without expecting specific structure
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [bloodRes, donorsRes] = await Promise.all([
        fetch('http://192.168.197.23:9090/blood-requests'),
        fetch('http://192.168.197.23:9090/users/donors')
      ]);

      // Get whatever data comes back
      const bloodData = await bloodRes.json();
      const donorsData = await donorsRes.json();

      setRawBloodRequests(Array.isArray(bloodData) ? bloodData : []);
      setRawDonors(Array.isArray(donorsData) ? donorsData : []);

    } catch (err) {
      console.log("Fetch error:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Count data regardless of structure
  const totalRequests = rawBloodRequests.length;
  const totalDonors = rawDonors.length;
  const completedCount = 2; // As per your requirement

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Connecting to database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Database Connection Error</h3>
        <p>{error}</p>
        <button onClick={fetchData}>Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1><FiDroplet /> Blood Bank Management</h1>
      </header>

      <div className="stats-grid">
        <StatCard 
          icon={<MdOutlineBloodtype />}
          title="Total Requests"
          value={totalRequests}
          action={() => {
            setActiveTab('requests');
            setShowAllData(true);
          }}
          actionText="View All"
        />
        
        <StatCard 
          icon={<FiCheckCircle />}
          title="Completed"
          value={completedCount}
        />
        
        <StatCard 
          icon={<FiUser />}
          title="Active Donors"
          value={totalDonors}
          action={() => {
            setActiveTab('donors');
            setShowAllData(true);
          }}
          actionText="Manage"
        />
      </div>

      {/* All Data Modal */}
      {showAllData && (
        <div className="data-modal">
          <div className="modal-header">
            <h2>{activeTab === 'requests' ? 'All Blood Requests' : 'All Donors'}</h2>
            <button onClick={() => setShowAllData(false)}>×</button>
          </div>
          
          <div className="data-tabs">
            <button 
              className={activeTab === 'requests' ? 'active' : ''}
              onClick={() => setActiveTab('requests')}
            >
              Requests
            </button>
            <button 
              className={activeTab === 'donors' ? 'active' : ''}
              onClick={() => setActiveTab('donors')}
            >
              Donors
            </button>
          </div>
          
          <div className="search-box">
            <FiSearch />
            <input type="text" placeholder={`Search ${activeTab}...`} />
          </div>
          
          <div className="data-table">
            {activeTab === 'requests' ? (
              <RequestTable data={rawBloodRequests} />
            ) : (
              <DonorTable data={rawDonors} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component to display request data without assuming structure
const RequestTable = ({ data }) => {
  // Try to extract known fields or use placeholder
  const getField = (item, field) => {
    return item[field] || item[field.toLowerCase()] || 'N/A';
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Patient</th>
          <th>Blood Type</th>
          <th>Hospital</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{getField(item, 'id')}</td>
            <td>{getField(item, 'patientName')}</td>
            <td>{getField(item, 'bloodGroup')}</td>
            <td>{getField(item, 'hospitalName')}</td>
            <td>{getField(item, 'currentStatus')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Component to display donor data without assuming structure
const DonorTable = ({ data }) => {
  const getField = (item, field) => {
    return item[field] || item[field.toLowerCase()] || 'N/A';
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Blood Type</th>
          <th>Contact</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{getField(item, 'id')}</td>
            <td>{getField(item, 'name')}</td>
            <td>{getField(item, 'bloodGroup')}</td>
            <td>{getField(item, 'phone') || getField(item, 'email')}</td>
            <td>{getField(item, 'isAvailable') ? 'Active' : 'Inactive'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Reusable stat card component
const StatCard = ({ icon, title, value, action, actionText }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
    {action && (
      <button className="stat-action" onClick={action}>
        {actionText}
      </button>
    )}
  </div>
);

export default Dashboard;