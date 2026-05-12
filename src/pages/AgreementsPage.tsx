import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Download, User, Calendar, Briefcase, CheckCircle, Search, X } from 'lucide-react';
import jsPDF from 'jspdf';

interface Agreement {
  id: string;
  client_name: string;
  project_name: string;
  project_price: string;
  project_scope: string;
  signature: string;
  created_at: string;
}

const AgreementsPage = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgreements(data || []);
    } catch (error) {
      console.error('Error fetching agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (agreement: Agreement) => {
    const doc = jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text('SULAIMAN.GRAPHICS', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Design & Digital Media Agreement', 20, 40);
    
    doc.text('Date Signed:', pageWidth - 60, 30);
    doc.setTextColor(15, 23, 42);
    doc.text(new Date(agreement.created_at).toLocaleDateString(), pageWidth - 60, 40);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 50, pageWidth - 20, 50);
    
    // Main Content
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    const introText = `This agreement is made between ${agreement.client_name} (The Client) and Sulaiman Graphics (The Designer).`;
    const splitIntro = doc.splitTextToSize(introText, pageWidth - 40);
    doc.text(splitIntro, 20, 65);
    
    // Sections
    let yPos = 85;
    
    const sections = [
      {
        title: '1. SCOPE OF WORK',
        content: `The Designer agrees to produce visual assets for "${agreement.project_name}". Specific deliverables: ${agreement.project_scope}. Any additional assets requested outside of this list will require a separate quote.`
      },
      {
        title: '2. PAYMENT & FILE DELIVERY',
        content: `The total fee for this project is ₦${agreement.project_price}. A 50% non-refundable deposit is required before work begins. The remaining 50% balance is due upon project completion. Final high-resolution files (PNG, JPG, Vector, or MP4) will be delivered only after the final invoice is paid in full.`
      },
      {
        title: '3. REVISIONS',
        content: `The Designer provides up to 2 rounds of revisions on the chosen concepts. A revision constitutes minor adjustments to color, typography, or layout. Complete redesigns or concept changes after approval will result in extra fees.`
      },
      {
        title: '4. OWNERSHIP & USAGE',
        content: `Upon final payment, full ownership and commercial rights to the final approved designs are transferred to the Client. The Designer retains the right to display the completed assets in their portfolio for marketing purposes.`
      }
    ];

    sections.forEach(section => {
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, yPos);
      doc.setFont('helvetica', 'normal');
      const splitContent = doc.splitTextToSize(section.content, pageWidth - 40);
      doc.text(splitContent, 20, yPos + 7);
      yPos += 35;
    });
    
    // Signature
    doc.setDrawColor(226, 232, 240);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('DIGITALLY SIGNED BY', 20, yPos);
    doc.setFont('cursive', 'normal');
    doc.setFontSize(20);
    doc.text(agreement.signature, 20, yPos + 15);
    
    doc.save(`agreement-${agreement.client_name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const filteredAgreements = agreements.filter(a => 
    a.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Client Agreements</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage signed design contracts</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search agreements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAgreements.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No agreements found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgreements.map((agreement) => (
            <div 
              key={agreement.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <button 
                  onClick={() => generatePDF(agreement)}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Download PDF"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
              
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{agreement.project_name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                <User className="h-3 w-3" /> {agreement.client_name}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                <span className="text-blue-600 dark:text-blue-400 font-bold">₦{agreement.project_price}</span>
                <button 
                  onClick={() => setSelectedAgreement(agreement)}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agreement Details Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agreement Details</h2>
              </div>
              <button 
                onClick={() => setSelectedAgreement(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Client Name</p>
                  <p className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" /> {selectedAgreement.client_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Signed On</p>
                  <p className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" /> {new Date(selectedAgreement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Fee</p>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">₦{selectedAgreement.project_price}</p>
                </div>
              </div>

              {/* Contract Text Matches Agreement.tsx exactly */}
              <div className="space-y-6 text-slate-600 dark:text-slate-300">
                <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">SULAIMAN.GRAPHICS</h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Design & Digital Media Agreement</p>
                </div>

                <p className="leading-relaxed">
                  This agreement is made between <span className="text-slate-900 dark:text-white font-bold">{selectedAgreement.client_name}</span> (The Client) and <span className="text-slate-900 dark:text-white font-bold">Sulaiman Graphics</span> (The Designer).
                </p>

                <div className="space-y-4">
                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. SCOPE OF WORK</h4>
                    <p className="text-sm leading-relaxed">
                      The Designer agrees to produce visual assets for <span className="text-slate-900 dark:text-white font-bold italic underline decoration-blue-500/30 tracking-tight">"{selectedAgreement.project_name}"</span>. The specific deliverables included are: <span className="text-slate-900 dark:text-white font-bold">{selectedAgreement.project_scope}</span>. Any additional assets requested outside of this list will require a separate quote.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. PAYMENT & FILE DELIVERY</h4>
                    <p className="text-sm leading-relaxed">
                      The total fee for this project is <span className="text-blue-600 dark:text-blue-400 font-bold">₦{selectedAgreement.project_price}</span>. A 50% non-refundable deposit is required before work begins. The remaining 50% balance is due upon project completion. Final high-resolution files (PNG, JPG, Vector, or MP4) will be delivered only after the final invoice is paid in full.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. REVISIONS</h4>
                    <p className="text-sm leading-relaxed">
                      The Designer provides up to 2 rounds of revisions on the chosen concepts. A revision constitutes minor adjustments to color, typography, or layout. Complete redesigns or concept changes after approval will result in extra fees.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">4. OWNERSHIP & USAGE</h4>
                    <p className="text-sm leading-relaxed">
                      Upon final payment, full ownership and commercial rights to the final approved designs are transferred to the Client. The Designer retains the right to display the completed assets in their portfolio for marketing purposes.
                    </p>
                  </section>
                </div>

                <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
                    <CheckCircle className="h-4 w-4" /> Digitally Signed By
                  </div>
                  <p className="text-3xl font-serif italic text-slate-900 dark:text-white">
                    {selectedAgreement.signature}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
              <button 
                onClick={() => generatePDF(selectedAgreement)}
                className="flex-1 bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95"
              >
                <Download className="h-5 w-5" /> Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementsPage;
