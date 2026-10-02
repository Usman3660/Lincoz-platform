import React, { useState, Component, Suspense, lazy } from 'react';
import { useApp } from './context/AppContext';
import { LandingPage } from './components/auth/LandingPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';

// Code-split dynamic routes, tabs, and modals for instant initial load performance
const AuthPage = lazy(() => import('./components/auth/AuthPage').then(m => ({ default: m.AuthPage })));
const SuperAdminDashboard = lazy(() => import('./components/dashboard/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const ProjectManagerDashboard = lazy(() => import('./components/dashboard/ProjectManagerDashboard').then(m => ({ default: m.ProjectManagerDashboard })));
const EngineerDashboard = lazy(() => import('./components/dashboard/EngineerDashboard').then(m => ({ default: m.EngineerDashboard })));
const PartnerDashboard = lazy(() => import('./components/dashboard/PartnerDashboard').then(m => ({ default: m.PartnerDashboard })));
const TaskBoard = lazy(() => import('./components/tasks/TaskBoard').then(m => ({ default: m.TaskBoard })));
const ProjectList = lazy(() => import('./components/projects/ProjectList').then(m => ({ default: m.ProjectList })));
const ClientDirectory = lazy(() => import('./components/clients/ClientDirectory').then(m => ({ default: m.ClientDirectory })));
const FinancialsLedger = lazy(() => import('./components/financials/FinancialsLedger').then(m => ({ default: m.FinancialsLedger })));
const ContractorManagement = lazy(() => import('./components/contractors/ContractorManagement').then(m => ({ default: m.ContractorManagement })));
const AuditLogViewer = lazy(() => import('./components/audit/AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));
const UserManagement = lazy(() => import('./components/users/UserManagement').then(m => ({ default: m.UserManagement })));
const DisbursementModal = lazy(() => import('./components/financials/DisbursementModal').then(m => ({ default: m.DisbursementModal })));
const TaskDetailModal = lazy(() => import('./components/tasks/TaskDetailModal').then(m => ({ default: m.TaskDetailModal })));
const CreateTaskModal = lazy(() => import('./components/tasks/CreateTaskModal').then(m => ({ default: m.CreateTaskModal })));
const SubmitDeliverableModal = lazy(() => import('./components/tasks/SubmitDeliverableModal').then(m => ({ default: m.SubmitDeliverableModal })));
const EditProfileModal = lazy(() => import('./components/profile/EditProfileModal').then(m => ({ default: m.EditProfileModal })));

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-12 text-slate-400 text-xs animate-fadeIn">
    <div className="flex items-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
      <span>Loading view...</span>
    </div>
  </div>
);

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#111827] border border-rose-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold">Platform State Recovery</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected client render state occurred. Click below to clear stored local state and restore clean platform data.
            </p>
            <p className="text-[10px] text-rose-400 font-mono bg-rose-950/40 p-2 rounded-lg border border-rose-500/20 truncate">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <RotateCcw className="w-4 h-4" /> Reset Platform & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const MainApp = () => {
  const {
    currentUser,
    setCurrentUserId,
    isSuperAdmin,
    isPM,
    isOnsiteMember,
    isPartner,
    pushNotification,
    isProfileModalOpen,
    closeProfileModal,
    profileModalUser
  } = useApp();

  // Navigation route: 'landing' | 'login' | 'signup' | 'app'
  const [currentRoute, setCurrentRoute] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Cross-component modal states
  const [selectedDisbursementItem, setSelectedDisbursementItem] = useState(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskForDeliverableSubmission, setTaskForDeliverableSubmission] = useState(null);

  // Handle direct quick login from Landing Page
  const handleQuickLoginFromLanding = (userId) => {
    setCurrentUserId(userId);
    setCurrentRoute('app');
    setActiveTab('dashboard');
  };

  // Handle successful login or registration
  const handleLoginSuccess = (user) => {
    setCurrentRoute('app');
    setActiveTab('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentRoute('landing');
    pushNotification('Logged Out', 'Returned to platform landing page.', 'info');
  };

  // 1. Landing Page View
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onNavigateToAuth={(mode) => setCurrentRoute(mode)}
        onQuickLogin={handleQuickLoginFromLanding}
      />
    );
  }

  // 2. Auth View (Login)
  if (currentRoute === 'login') {
    return (
      <Suspense fallback={<ComponentLoader />}>
        <AuthPage
          onNavigateToLanding={() => setCurrentRoute('landing')}
          onLoginSuccess={handleLoginSuccess}
        />
      </Suspense>
    );
  }

  // 3. Platform Workspace View
  const renderDashboard = () => {
    if (isSuperAdmin()) {
      return (
        <SuperAdminDashboard
          setActiveTab={setActiveTab}
          onOpenDisbursementModal={(item) => setSelectedDisbursementItem(item)}
          onSelectTask={(task) => setSelectedTaskForModal(task)}
        />
      );
    }
    if (isPM()) {
      return (
        <ProjectManagerDashboard
          setActiveTab={setActiveTab}
          onSelectTask={(task) => setSelectedTaskForModal(task)}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        />
      );
    }
    if (isOnsiteMember()) {
      return (
        <EngineerDashboard
          setActiveTab={setActiveTab}
          onSelectTask={(task) => setSelectedTaskForModal(task)}
        />
      );
    }
    if (isPartner()) {
      return (
        <PartnerDashboard
          setActiveTab={setActiveTab}
          onSelectTask={(task) => setSelectedTaskForModal(task)}
          onOpenSubmitDeliverable={(task) => setTaskForDeliverableSubmission(task)}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Header with Logout */}
      <Header onLogout={handleLogout} />

      <div className="flex-1 flex overflow-hidden">
        {/* Role-Scoped Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-12">
            <Suspense fallback={<ComponentLoader />}>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'projects' && <ProjectList />}
              {activeTab === 'clients' && <ClientDirectory />}
              {activeTab === 'tasks' && (
                <TaskBoard
                  selectedTaskId={selectedTaskForModal?.id}
                  onClearSelectedTask={() => setSelectedTaskForModal(null)}
                />
              )}
              {activeTab === 'financials' && (
                <FinancialsLedger
                  onOpenDisbursement={(item) => setSelectedDisbursementItem(item)}
                />
              )}
              {activeTab === 'contractors' && <ContractorManagement />}
              {activeTab === 'audit' && <AuditLogViewer />}
              {activeTab === 'users' && <UserManagement />}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <Suspense fallback={null}>
        {selectedDisbursementItem && (
          <DisbursementModal
            isOpen={!!selectedDisbursementItem}
            onClose={() => setSelectedDisbursementItem(null)}
            payoutItem={selectedDisbursementItem}
          />
        )}

        {selectedTaskForModal && (
          <TaskDetailModal
            isOpen={!!selectedTaskForModal}
            onClose={() => setSelectedTaskForModal(null)}
            task={selectedTaskForModal}
          />
        )}

        {isCreateTaskOpen && (
          <CreateTaskModal
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
          />
        )}

        {taskForDeliverableSubmission && (
          <SubmitDeliverableModal
            isOpen={!!taskForDeliverableSubmission}
            onClose={() => setTaskForDeliverableSubmission(null)}
            task={taskForDeliverableSubmission}
          />
        )}

        {isProfileModalOpen && (
          <EditProfileModal
            isOpen={isProfileModalOpen}
            onClose={closeProfileModal}
            userToEdit={profileModalUser}
          />
        )}
      </Suspense>

    </div>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
};
