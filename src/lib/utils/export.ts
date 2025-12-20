/**
 * Export Utilities for PPDB and Admin Dashboard
 * Supports CSV, JSON, and basic PDF export
 */

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export PPDB entries to detailed format
 */
export const exportPPDBToCSV = (entries: any[]) => {
  const formatted = entries.map((entry) => ({
    'Nomor Pendaftaran': entry.registrationNumber,
    'Nama Lengkap': entry.fullName,
    'NISN': entry.nisn,
    'NIK': entry.nik,
    'Email': entry.email,
    'Tempat Lahir': entry.birthPlace,
    'Tanggal Lahir': new Date(entry.birthDate).toLocaleDateString('id-ID'),
    'Asal Sekolah': entry.previousSchool,
    'Rata-Rata Nilai': entry.averageScore,
    'Pilihan Jurusan 1': entry.majorChoice1,
    'Pilihan Jurusan 2': entry.majorChoice2 || '-',
    'Pilihan Jurusan 3': entry.majorChoice3 || '-',
    'Status': entry.status,
    'Tanggal Daftar': new Date(entry.createdAt).toLocaleDateString('id-ID'),
  }));

  exportToCSV(formatted, `PPDB_${new Date().toISOString().split('T')[0]}`);
};

/**
 * Export job postings to CSV
 */
export const exportJobPostingsToCSV = (postings: any[]) => {
  const formatted = postings.map((posting) => ({
    'Posisi': posting.position,
    'Perusahaan': posting.company,
    'Lokasi': posting.location,
    'Deskripsi': posting.description?.substring(0, 100) || '-',
    'Tanggal Posting': new Date(posting.createdAt).toLocaleDateString('id-ID'),
    'Status': 'Aktif',
  }));

  exportToCSV(formatted, `JobPostings_${new Date().toISOString().split('T')[0]}`);
};

/**
 * Generate simple PDF-like text report
 */
export const generateReport = (title: string, data: string[]): string => {
  const date = new Date().toLocaleDateString('id-ID');
  const time = new Date().toLocaleTimeString('id-ID');
  
  let report = `
=====================================
${title}
=====================================
Tanggal: ${date}
Waktu: ${time}

${data.join('\n')}

=====================================
  `;

  return report;
};

/**
 * Export statistics to PDF-like text format
 */
export const exportStatisticsReport = (stats: any) => {
  const reportData = [
    `Total Pendaftar PPDB: ${stats.totalStats?.ppdbCount || 0}`,
    `Total Lamaran Kerja: ${stats.totalStats?.applicationsCount || 0}`,
    `Total Alumni: ${stats.totalStats?.alumniCount || 0}`,
    `Total Lowongan Aktif: ${stats.totalStats?.jobPostingsCount || 0}`,
    `Total Pengguna: ${stats.totalStats?.usersCount || 0}`,
    '',
    'Distribusi Status PPDB:',
    ...(stats.ppdbDistribution?.map((item: any) => `  - ${item.status}: ${item._count}`) || []),
  ];

  const report = generateReport('LAPORAN STATISTIK SMK SUNAN GIRI', reportData);
  
  // Download as text file
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Statistics_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Print-friendly view
 */
export const openPrintView = (html: string, title: string) => {
  const printWindow = window.open('', '', 'width=900,height=600');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            h1 { text-align: center; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${html}
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};
