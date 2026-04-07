import React, { useState } from 'react';
import OwnershipCertificate from './OwnershipCertificate';

interface Project {
  id: string;
  title: string;
  client_email: string;
  status: string;
  updated_at: string;
}

export const CertificatePortal = ({ project, isAdmin }: { project: Project, isAdmin: boolean }) => {
  const [verifiedName, setVerifiedName] = useState(project.client_email);
  const licenseID = `SG-${project.id.slice(0, 8).toUpperCase()}`;

  // If status is not Completed or Drafting, show nothing
  if (project.status !== 'Completed' && !isAdmin) return null;
  if (project.status !== 'Completed' && project.status !== 'Drafting' && isAdmin) return null;

  return (
    <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
      {isAdmin && project.status === 'Drafting' ? (
        <div className="space-y-4">
          <h3 className="text-yellow-500 font-bold flex items-center gap-2">
            ⚠️ Admin Verification Mode
          </h3>
          <p className="text-xs text-slate-300">Confirm the client's legal name before releasing:</p>
          <input 
            type="text" 
            value={verifiedName}
            onChange={(e) => setVerifiedName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 p-2 rounded text-white"
            placeholder="Enter Client Full Name"
          />
          <OwnershipCertificate 
            clientName={verifiedName}
            projectTitle={project.title}
            date={new Date().toLocaleDateString()}
            licenseNumber={licenseID}
            isAdmin={true}
          />
          <p className="text-[10px] text-slate-500 text-center mt-2">
            Tip: Download your copy first, then change status to "Completed" to release to client.
          </p>
        </div>
      ) : (
        /* Client View / Final Admin View */
        <div className="text-center">
          <h4 className="text-green-400 font-semibold mb-2 text-sm">✓ Ownership Rights Available</h4>
          <OwnershipCertificate 
            clientName={project.client_email}
            projectTitle={project.title}
            date={new Date(project.updated_at).toLocaleDateString()}
            licenseNumber={licenseID}
          />
        </div>
      )}
    </div>
  );
};
