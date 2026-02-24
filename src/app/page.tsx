'use client';

// SmartWarga RT 03 - Main Application
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
import PublicDashboard from '@/components/smartwarga/PublicDashboard';
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
  const [hasAdmin, setHasAdmin] = useState(false); // Track if admin exists in DB

  const [residents, setResidents] = useState<Resident[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
  const [rtConfig, setRtConfig] = useState<RTConfig>(DEFAULT_RT_CONFIG);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for saved session
        const savedUser = localStorage.getItem('smartwarga_user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }

        // Check if admin exists in database
        const adminsRes = await fetch('/api/admin');
        if (adminsRes.ok) {
          const adminsData = await adminsRes.json();
          setHasAdmin(adminsData.data?.length > 0);
        }

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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check for new admin after adding
  const checkAdminStatus = async () => {
    const adminsRes = await fetch('/api/admin');
    if (adminsRes.ok) {
      const adminsData = await adminsRes.json();
      const adminCount = adminsData.data?.length || 0;
      setHasAdmin(adminCount > 0);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      setCurrentUser(null);
      localStorage.removeItem('smartwarga_user');
      setActiveTab('dashboard');
      checkAdminStatus(); // Re-check admin status
    }
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
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

  const handleSaveResident = async (data: Resident) => {
    try {
      if (editingResident) {
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
        body: JSON.stringify({ ...req, currentUser: currentUser?.name || 'Warga' })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setRequests(prev => [result.data, ...prev]);
          alert('Pengajuan surat berhasil dikirim! Silakan tunggu verifikasi dari RT.');
        }
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Terjadi kesalahan saat mengirim pengajuan.');
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
      {/* Sidebar - only show when logged in */}
      {currentUser && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
          onOpenService={() => { setIsServiceModalOpen(true); setIsSidebarOpen(false); }}
          onOpenRegister={() => setIsResidentModalOpen(true)}
          userRole={currentUser.role}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
          isLoggedIn={true}
          rtConfig={rtConfig}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header 
          user={currentUser} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onAdminClick={() => setActiveTab('login')}
          rtConfig={rtConfig}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
          {activeTab === 'login' && !currentUser ? (
            <LoginPage 
              rtConfig={rtConfig}
              onLogin={handleLogin}
            />
          ) : !currentUser ? (
            // Dashboard publik untuk pengunjung/warga
            <PublicDashboard 
              rtConfig={rtConfig}
              residents={residents}
              requests={requests}
              onLoginClick={() => setActiveTab('login')}
              onOpenService={() => setIsServiceModalOpen(true)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  residentsCount={residents.length} 
                  residents={residents}
                  requests={requests} 
                  onOpenRegister={() => setIsResidentModalOpen(true)}
                  isLoggedIn={true}
                  onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                  onDeleteResident={handleDeleteResident}
                />
              )}
                  
              {activeTab === 'warga' && (
                <ResidentDatabase 
                  residents={residents}
                  onAddResident={() => setIsResidentModalOpen(true)} 
                  onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                  onDeleteResident={handleDeleteResident}
                  userRole={currentUser.role as AdminRole}
                  currentUser={currentUser.name}
                  onRefresh={refreshResidents}
                />
              )}
              
              {activeTab === 'surat' && (
                <LetterRequests 
                  requests={requests} 
                  onUpdateStatus={handleUpdateRequestStatus} 
                  isLoggedIn={true} 
                  rtConfig={rtConfig} 
                />
              )}
              
              {activeTab === 'admin' && (
                <AdminManagement 
                  userRole={currentUser.role} 
                  onLogout={handleLogout} 
                  rtConfig={rtConfig} 
                  setRtConfig={handleUpdateConfig}
                  currentUser={currentUser}
                  residents={residents}
                  onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                  onDeleteResident={handleDeleteResident}
                  onAdminAdded={checkAdminStatus}
                />
              )}
              
              {activeTab === 'audit' && (
                <AuditLog logs={auditLogs} />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (Mobile) - only show when logged in */}
        {currentUser && (
          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenService={() => setIsServiceModalOpen(true)}
            onOpenRegister={() => setIsResidentModalOpen(true)}
            isLoggedIn={true}
          />
        )}
      </div>

      {/* Modals - show for both logged in and public users */}
      <ServiceRequestModal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
        onSubmit={handleSubmitRequest} 
        rtConfig={rtConfig}
      />
      
      {/* AI Assistant - show for all users (public warga) */}
      <AIAssistant rtConfig={rtConfig} />
      
      {/* Admin-only modals */}
      {currentUser && (
        <ResidentFormModal 
          isOpen={isResidentModalOpen} 
          onClose={() => { setIsResidentModalOpen(false); setEditingResident(null); }} 
          onSave={handleSaveResident} 
          initialData={editingResident} 
          isAdmin={true}
        />
      )}
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
