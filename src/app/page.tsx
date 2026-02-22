'use client';

// SmartWarga RT 03 - Main Application
// Updated with Google Sheets Sync feature
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/smartwarga/Sidebar';
import Header from '@/components/smartwarga/Header';
import Dashboard from '@/components/smartwarga/Dashboard';
import ResidentDatabase from '@/components/smartwarga/ResidentDatabase';
import LetterRequests from '@/components/smartwarga/LetterRequests';
import AdminManagement from '@/components/smartwarga/AdminManagement';
import AuditLog from '@/components/smartwarga/AuditLog';
import BottomNav from '@/components/smartwarga/BottomNav';
import ServiceRequestModal from '@/components/smartwarga/ServiceRequestModal';
import ResidentFormModal from '@/components/smartwarga/ResidentFormModal';
import LoginPage from '@/components/smartwarga/LoginPage';
import AIAssistant from '@/components/smartwarga/AIAssistant';
import InstallPrompt from '@/components/smartwarga/InstallPrompt';
import { AdminUser, Resident, ServiceRequest, RTConfig, AuditLog as AuditLogType, AdminRole } from '@/lib/types';
import { DEFAULT_RT_CONFIG } from '@/lib/constants';

type TabType = 'dashboard' | 'warga' | 'surat' | 'admin' | 'audit' | 'login';

export default function SmartWargaApp() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [residents, setResidents] = useState<Resident[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
  const [rtConfig, setRtConfig] = useState<RTConfig>(DEFAULT_RT_CONFIG);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch config
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.success && configData.data) {
            setRtConfig(configData.data);
          }
        }

        // Fetch residents
        const residentsRes = await fetch('/api/residents');
        if (residentsRes.ok) {
          const residentsData = await residentsRes.json();
          if (residentsData.success) {
            setResidents(residentsData.data || []);
          }
        }

        // Fetch requests
        const requestsRes = await fetch('/api/requests');
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          if (requestsData.success) {
            setRequests(requestsData.data || []);
          }
        }

        // Fetch audit logs
        const logsRes = await fetch('/api/audit');
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          if (logsData.success) {
            setAuditLogs(logsData.data || []);
          }
        }

        // Check for saved user session
        const savedUser = localStorage.getItem('smartwarga_user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    if (window.confirm(`Apakah Anda yakin ingin keluar dari ${rtConfig.appName}?`)) {
      setCurrentUser(null);
      localStorage.removeItem('smartwarga_user');
      setActiveTab('dashboard');
    }
  };

  // Refresh residents data after sync
  const refreshResidents = async () => {
    try {
      const residentsRes = await fetch('/api/residents');
      if (residentsRes.ok) {
        const residentsData = await residentsRes.json();
        if (residentsData.success) {
          setResidents(residentsData.data || []);
        }
      }
    } catch (error) {
      console.error('Error refreshing residents:', error);
    }
  };

  const handleLogin = async (username: string, _password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        localStorage.setItem('smartwarga_user', JSON.stringify(data.data));
        setActiveTab('dashboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleSaveResident = async (data: Resident) => {
    try {
      if (editingResident) {
        // Update existing resident
        const res = await fetch('/api/residents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, currentUser: currentUser?.name })
        });
        if (res.ok) {
          setResidents(prev => prev.map(r => r.nik === editingResident.nik ? { ...r, ...data } : r));
          setIsResidentModalOpen(false);
          setEditingResident(null);
        } else {
          const result = await res.json();
          alert(result.error || 'Gagal menyimpan data');
        }
      } else {
        // Create new resident
        const res = await fetch('/api/residents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, currentUser: currentUser?.name })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setResidents(prev => [result.data, ...prev]);
          setIsResidentModalOpen(false);
          setEditingResident(null);
        } else {
          // Show error message to user
          alert(result.error || 'Gagal menyimpan data');
        }
      }
    } catch (error) {
      console.error('Error saving resident:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const handleDeleteResident = async (nik: string) => {
    try {
      const res = await fetch(`/api/residents?nik=${nik}&currentUser=${currentUser?.name}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setResidents(prev => prev.filter(r => r.nik !== nik));
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, currentUser: currentUser?.name })
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleSubmitRequest = async (req: ServiceRequest) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setRequests(prev => [result.data, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const handleUpdateConfig = async (newConfig: RTConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newConfig, currentUser: currentUser?.name })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setRtConfig(result.data);
        }
      }
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat SmartWarga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        onOpenService={() => { setIsServiceModalOpen(true); setIsSidebarOpen(false); }}
        onOpenRegister={() => setIsResidentModalOpen(true)}
        userRole={currentUser?.role || null}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        rtConfig={rtConfig}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header 
          user={currentUser} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onAdminClick={() => setActiveTab('login')} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
          {activeTab === 'login' && !currentUser ? (
            <LoginPage 
              rtConfig={rtConfig}
              onLogin={handleLogin}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  residentsCount={residents.length} 
                  residents={residents}
                  requests={requests} 
                  onOpenRegister={() => setIsResidentModalOpen(true)}
                  isLoggedIn={!!currentUser}
                  onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                  onDeleteResident={handleDeleteResident}
                />
              )}
              
              {activeTab === 'warga' && (
                currentUser ? (
                  <ResidentDatabase 
                    residents={residents}
                    onAddResident={() => setIsResidentModalOpen(true)} 
                    onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                    onDeleteResident={handleDeleteResident}
                    userRole={currentUser.role as AdminRole}
                    currentUser={currentUser.name}
                    onRefresh={refreshResidents}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                    <h3 className="text-lg font-bold text-slate-800">Akses Terbatas</h3>
                    <p className="text-slate-500 text-sm">Silakan login sebagai admin untuk melihat database.</p>
                  </div>
                )
              )}
              
              {activeTab === 'surat' && (
                <LetterRequests 
                  requests={requests} 
                  onUpdateStatus={handleUpdateRequestStatus} 
                  isLoggedIn={!!currentUser} 
                  rtConfig={rtConfig} 
                />
              )}
              
              {activeTab === 'admin' && currentUser && (
                <AdminManagement 
                  userRole={currentUser.role} 
                  onLogout={handleLogout} 
                  rtConfig={rtConfig} 
                  setRtConfig={handleUpdateConfig}
                  currentUser={currentUser}
                  residents={residents}
                  onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                  onDeleteResident={handleDeleteResident}
                />
              )}
              
              {activeTab === 'audit' && currentUser && (
                <AuditLog logs={auditLogs} />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (Mobile) */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenService={() => setIsServiceModalOpen(true)}
          onOpenRegister={() => setIsResidentModalOpen(true)}
          isLoggedIn={!!currentUser}
        />
      </div>

      {/* Modals */}
      <ServiceRequestModal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
        onSubmit={handleSubmitRequest} 
        rtConfig={rtConfig}
      />
      
      <ResidentFormModal 
        isOpen={isResidentModalOpen} 
        onClose={() => { setIsResidentModalOpen(false); setEditingResident(null); }} 
        onSave={handleSaveResident} 
        initialData={editingResident} 
        isAdmin={!!currentUser}
      />
      
      {/* AI Assistant */}
      <AIAssistant rtConfig={rtConfig} />
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
