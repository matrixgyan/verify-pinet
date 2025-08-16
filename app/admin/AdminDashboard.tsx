
'use client';

import { useState, useEffect } from 'react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [claimData, setClaimData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminSettings, setAdminSettings] = useState({
    customUrl: 'admin',
    enableFooterIcon: true
  });
  const [settingsChanged, setSettingsChanged] = useState(false);

  useEffect(() => {
    loadClaimData();
    loadAdminSettings();
    const interval = setInterval(loadClaimData, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAdminSettings = () => {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{"customUrl":"admin","enableFooterIcon":true}');
    setAdminSettings(settings);
  };

  const saveAdminSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    setSettingsChanged(false);

    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = '<i class="ri-check-line mr-2"></i>Settings saved successfully!';
    document.body.appendChild(successDiv);
    setTimeout(() => {
      document.body.removeChild(successDiv);
    }, 3000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setAdminSettings(prev => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  };

  const loadClaimData = () => {
    try {
      // Try to load main data
      let data = JSON.parse(localStorage.getItem('claimData') || '[]');
      
      // Also check for individual claim entries and backup data
      const allKeys = Object.keys(localStorage);
      const claimKeys = allKeys.filter(key => key.startsWith('claim_'));
      const backupKeys = allKeys.filter(key => key.startsWith('claimData_backup_'));
      
      // Merge individual claims
      claimKeys.forEach(key => {
        try {
          const individualClaim = JSON.parse(localStorage.getItem(key) || '{}');
          if (individualClaim.id && !data.find((item: any) => item.id === individualClaim.id)) {
            data.push(individualClaim);
          }
        } catch (error) {
          console.error('Error loading individual claim:', error);
        }
      });
      
      // If no main data but backup exists, restore from latest backup
      if (data.length === 0 && backupKeys.length > 0) {
        const latestBackup = backupKeys.sort().pop();
        if (latestBackup) {
          try {
            const backupData = JSON.parse(localStorage.getItem(latestBackup) || '[]');
            data = backupData;
            // Restore main data from backup
            localStorage.setItem('claimData', JSON.stringify(data));
          } catch (error) {
            console.error('Error restoring from backup:', error);
          }
        }
      }
      
      // Sort by timestamp (newest first)
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setClaimData(data);
      console.log('Loaded claim data:', data.length, 'entries');
    } catch (error) {
      console.error('Error loading claim data:', error);
      setClaimData([]);
    }
  };

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(claimData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pi_network_claims_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const backupData = () => {
    try {
      const timestamp = Date.now();
      const backupKey = `claimData_backup_${timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(claimData));
      
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.innerHTML = '<i class="ri-save-line mr-2"></i>Data backed up successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
    } catch (error) {
      console.error('Error backing up data:', error);
    }
  };

  const updateUserStatus = (userId: number, newStatus: string) => {
    try {
      const data = JSON.parse(localStorage.getItem('claimData') || '[]');
      const updatedData = data.map((item: any) => 
        item.id === userId ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
      );
      
      // Save to multiple locations for redundancy
      localStorage.setItem('claimData', JSON.stringify(updatedData));
      localStorage.setItem(`claim_${userId}`, JSON.stringify(updatedData.find((item: any) => item.id === userId)));
      
      loadClaimData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = (userId: number) => {
    try {
      const data = JSON.parse(localStorage.getItem('claimData') || '[]');
      const updatedData = data.filter((item: any) => item.id !== userId);
      localStorage.setItem('claimData', JSON.stringify(updatedData));
      
      // Also remove individual entry
      localStorage.removeItem(`claim_${userId}`);
      
      loadClaimData();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return 'text-yellow-600 bg-yellow-50';
      case 'verified': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const totalUsers = claimData.length;
  const pendingUsers = claimData.filter(user => user.status === 'under_review').length;
  const verifiedUsers = claimData.filter(user => user.status === 'verified').length;
  const rejectedUsers = claimData.filter(user => user.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold font-[\'Pacifico\']">π</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pi Network Admin</h1>
                <p className="text-sm text-gray-600">Balance Claim Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-download-line"></i>
                <span>Export</span>
              </button>
              <button
                onClick={backupData}
                className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-save-line"></i>
                <span>Backup</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-logout-box-line"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{verifiedUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-close-line text-red-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedUsers}</p>
              </div>
            </div>
          </div>
        </div>

// ... rest of existing code remains the same ...

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {[ 
                { id: 'overview', label: 'User Overview', icon: 'ri-dashboard-line' },
                { id: 'details', label: 'Detailed View', icon: 'ri-file-list-line' },
                { id: 'settings', label: 'Settings', icon: 'ri-settings-3-line' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.id 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimData.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.kycName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.kycName}</p>
                              <p className="text-sm text-gray-500">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(user.timestamp).toLocaleDateString()} {new Date(user.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => updateUserStatus(user.id, user.status === 'verified' ? 'under_review' : 'verified')}
                              className="text-green-600 hover:text-green-800 cursor-pointer"
                            >
                              <i className="ri-check-line"></i>
                            </button>
                            <button
                              onClick={() => updateUserStatus(user.id, 'rejected')}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {claimData.length === 0 && (
                  <div className="text-center py-12">
                    <i className="ri-inbox-line text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">No claim submissions yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin Panel Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Custom Admin URL */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="ri-link text-blue-600 text-xl"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Custom Admin URL</h4>
                          <p className="text-sm text-gray-600">Set a custom URL path for admin access</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Admin URL Path
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">yoursite.com/</span>
                          <input
                            type="text"
                            value={adminSettings.customUrl}
                            onChange={(e) => handleSettingChange('customUrl', e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="admin"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Current access URL: <span className="font-mono bg-gray-200 px-2 py-1 rounded">/{adminSettings.customUrl}</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer Icon Toggle */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <i className="ri-cursor-line text-purple-600 text-xl"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Homepage Footer Icon</h4>
                          <p className="text-sm text-gray-600">Enable or disable the admin login icon in homepage footer</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Footer Admin Icon</span>
                          <p className="text-xs text-gray-500">Shows discrete admin login icon in homepage footer</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('enableFooterIcon', !adminSettings.enableFooterIcon)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
                            adminSettings.enableFooterIcon ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              adminSettings.enableFooterIcon ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className={`mt-3 p-3 rounded-lg ${adminSettings.enableFooterIcon ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className={`text-xs ${adminSettings.enableFooterIcon ? 'text-green-700' : 'text-red-700'}`}>
                          {adminSettings.enableFooterIcon 
                            ? 'Footer admin icon is enabled and visible on homepage'
                            : 'Footer admin icon is disabled and hidden from homepage'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <i className="ri-shield-line text-yellow-600 text-xl mt-0.5"></i>
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-1">Security Notice</h4>
                          <p className="text-sm text-yellow-700">
                            Custom URLs and hidden admin access help protect your admin panel from unauthorized access. 
                            Keep your custom URL private and change it periodically for better security.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        onClick={() => {
                          loadAdminSettings();
                          setSettingsChanged(false);
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        onClick={saveAdminSettings}
                        disabled={!settingsChanged}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                          settingsChanged 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && selectedUser && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">User Details: {selectedUser.kycName}</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">KYC Name:</span>
                        <span className="font-medium">{selectedUser.kycName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-medium">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                          {selectedUser.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Verification Data</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Face Verification:</span>
                        <span className="font-medium text-green-600"> Completed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seed Phrase:</span>
                        <span className="font-medium text-green-600"> Verified</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">{new Date(selectedUser.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Seed Phrase (Encrypted)</h4>
                    <div className="bg-white rounded border p-3 font-mono text-sm break-all">
                      {selectedUser.seedPhrase}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'verified')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => deleteUser(selectedUser.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && !selectedUser && (
              <div className="text-center py-12">
                <i className="ri-file-list-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">Select a user from the overview to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}