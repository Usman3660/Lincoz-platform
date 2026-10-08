import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  Users,
  Building,
  CreditCard,
  Percent,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Mail,
  User,
  Briefcase,
  MapPin,
  Sparkles
} from 'lucide-react';

export const AddContractorModal = ({ isOpen, onClose }) => {
  const {
    createUser,
    contractors,
    setContractors,
    projects,
    updateProject,
    pushNotification,
    recordAuditLog
  } = useApp();

  // Contractor Personal & Account details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('Partner Contractor');
  
  // Legal & Tax details
  const [legalName, setLegalName] = useState('');
  const [taxClassification, setTaxClassification] = useState('US W-9 (Individual / LLC)');
  const [taxId, setTaxId] = useState('');
  const [country, setCountry] = useState('United States / Remote');

  // Payout Channel
  const [payoutChannel, setPayoutChannel] = useState('Wise Wire Transfer');
  const [payoutDetails, setPayoutDetails] = useState('');

  // Initial Project Commission Setup
  const [assignProjectId, setAssignProjectId] = useState(projects[0]?.id || '');
  const [model, setModel] = useState('NET_REVENUE_SHARE');
  const [sharePercentage, setSharePercentage] = useState(15);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const contractorLegalName = legalName.trim() || `${name.trim()} Solutions LLC`;
    const contractorTaxId = taxId.trim() || `US-EIN-${Math.floor(100000 + Math.random() * 900000)}`;
    const contractorPayoutDetails = payoutDetails.trim() || `${email.trim()} (Wise USD Wire)`;

    // 1. Create User account with role 'PARTNER'
    const newUser = createUser({
      name: name.trim(),
      email: email.trim(),
      role: 'PARTNER',
      title: title.trim() || 'Contractor Partner',
      department: 'External Contractor',
      organization: contractorLegalName,
      taxId: contractorTaxId,
      payoutChannel
    });

    // 2. Prepare Agreement if a project was selected
    const initialAgreements = [];
    if (assignProjectId) {
      initialAgreements.push({
        projectId: assignProjectId,
        model,
        sharePercentage: Number(sharePercentage) || 15,
        notes: notes.trim() || `${sharePercentage}% ${model.replace(/_/g, ' ')}`,
        contractSignedDate: new Date().toISOString().split('T')[0]
      });

      // Update project assigned team to include new contractor
      const targetProj = projects.find(p => p.id === assignProjectId);
      if (targetProj) {
        const teamIds = [...(targetProj.assignedTeamIds || [])];
        if (!teamIds.includes(newUser.id)) {
          teamIds.push(newUser.id);
          updateProject(assignProjectId, { assignedTeamIds: teamIds });
        }
      }
    }

    // 3. Create or Update Contractor entry in contractors state
    const newContractorRecord = {
      userId: newUser.id,
      legalName: contractorLegalName,
      taxClassification,
      taxId: contractorTaxId,
      country: country.trim() || 'Remote',
      defaultPayoutChannel: payoutChannel,
      payoutDetails: contractorPayoutDetails,
      agreements: initialAgreements
    };

    setContractors(prev => {
      const filtered = prev.filter(c => c.userId !== newUser.id);
      return [...filtered, newContractorRecord];
    });

    recordAuditLog({
      actionType: 'CONTRACTOR_ONBOARDED',
      itemText: `Super Admin provisioned and configured contractor partner "${name.trim()}" (${contractorLegalName}) with ${sharePercentage}% agreement.`,
      previousState: null,
      newState: newContractorRecord
    });

    pushNotification(
      'Contractor Onboarded',
      `Successfully added ${name.trim()} and configured commission setup.`,
      'success'
    );

    // Reset Form
    setName('');
    setEmail('');
    setTitle('Partner Contractor');
    setLegalName('');
    setTaxId('');
    setPayoutDetails('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Partner Contractor"
      subtitle="Provision contractor identity, configure tax classification, and set up project commission agreements."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Step 1: Personal & Account Identity */}
        <div className="p-4 rounded-2xl bg-[#182234] border border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <User className="w-4 h-4" /> 1. Contractor Identity & Account
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Work Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. elena@rostovatech.io"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Expertise / Title Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Smart Contract Security Specialist"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Legal Entity & Tax Setup */}
        <div className="p-4 rounded-2xl bg-[#182234] border border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Building className="w-4 h-4" /> 2. Legal Entity & Tax Classification
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Rostova CyberTech Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tax ID (EIN / VAT / SSN)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="e.g. EU-VAT-89102477B"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tax Classification
              </label>
              <select
                value={taxClassification}
                onChange={(e) => setTaxClassification(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="US W-9 (Individual / LLC)">US W-9 (Individual / LLC)</option>
                <option value="EU-VAT (Corporate / Freelancer)">EU-VAT (Corporate / Freelancer)</option>
                <option value="International W-8BEN-E (Corporate)">International W-8BEN-E (Corporate)</option>
                <option value="International W-8BEN (Individual)">International W-8BEN (Individual)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Jurisdiction / Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Estonia / Remote"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Default Disbursement Channel */}
        <div className="p-4 rounded-2xl bg-[#182234] border border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4" /> 3. Default Disbursement Channel
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Payout Channel Method
              </label>
              <select
                value={payoutChannel}
                onChange={(e) => setPayoutChannel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Wise Wire Transfer">Wise Multi-Currency Wire</option>
                <option value="Direct ACH / Bank Wire">Direct ACH / FedWire</option>
                <option value="Stripe Connect Express">Stripe Connect Express</option>
                <option value="USDC / Smart Contract Escrow">USDC / Smart Contract Escrow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Payout Destination / Account Ref
              </label>
              <input
                type="text"
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder="e.g. wise://account/rostova or 0x84A9..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Initial Project Commission Setup */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Percent className="w-4 h-4" /> 4. Project Commission Setup (Immediate)
            </div>
            <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
              Super Admin Setup
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Assign to Project
              </label>
              <select
                value={assignProjectId}
                onChange={(e) => setAssignProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Assign Later --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Commission Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="NET_REVENUE_SHARE">Net Revenue Share</option>
                <option value="GROSS_INVOICE_SHARE">Gross Contract Share</option>
                <option value="PROJECT_DIRECT_SHARE">Project Direct Share</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Share Percentage (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={sharePercentage}
                onChange={(e) => setSharePercentage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Agreement Terms & Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 15% Net Share after AWS Cloud Hardware Direct Expenses"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete Contractor Setup
          </button>
        </div>

      </form>
    </Modal>
  );
};
