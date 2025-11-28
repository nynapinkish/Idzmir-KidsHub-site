// Form paths
const formPaths = {
    'CT-Form01': 'Forms/formCT01.html',
    'CT-Form02': 'Forms/formCT02.html',
    'CC-Form01': 'Forms/formCC01.html',
    'CC-Form02': 'Forms/formCC02.html',
    'CA-Form01': 'Forms/formCA01.html',
    'CA-Form02': 'Forms/formCA02.html'
};

// Backend API URL
const API_URL = 'http://localhost:5000/api';

// Sample data storage
const sampleData = {
    ct1: [],
    ct2: [],
    cc1: [],
    cc2: [],
    ca1: [],
    ca2: []
};

// Global state
let isLoading = false;

// ========================================
// 📤 IMPORT EXCEL FUNCTION - ENHANCED
// ========================================
async function importExcel(event, tableId) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
        showNotification('❌ Please upload a valid Excel file (.xlsx or .xls)', 'error');
        event.target.value = '';
        return;
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showNotification('❌ File size exceeds 10MB limit', 'error');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            console.log('📂 Reading Excel file:', file.name);
            console.log('📂 File size:', (file.size / 1024).toFixed(2), 'KB');
            
            // Parse Excel file using SheetJS
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first sheet
            const sheetName = workbook.SheetNames[0];
            console.log('📄 Sheet name:', sheetName);
            
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            console.log('📊 Parsed Excel data:', jsonData);
            console.log(`📊 Total rows found: ${jsonData.length}`);
            
            if (jsonData.length === 0) {
                showNotification('❌ Excel file is empty! Please check your file.', 'error');
                event.target.value = '';
                return;
            }
            
            // Validate required fields
            const requiredFields = ['Parent First Name', 'Phone Number', 'Email'];
            const sampleRow = jsonData[0];
            const missingFields = requiredFields.filter(field => 
                !sampleRow.hasOwnProperty(field) && 
                !sampleRow.hasOwnProperty(field.replace(/\s/g, ''))
            );
            
            if (missingFields.length > 0) {
                const proceed = confirm(
                    `⚠️ Warning: Some required columns might be missing:\n\n` +
                    `Expected: ${requiredFields.join(', ')}\n` +
                    `Found: ${Object.keys(sampleRow).slice(0, 5).join(', ')}...\n\n` +
                    `Continue anyway?`
                );
                
                if (!proceed) {
                    event.target.value = '';
                    return;
                }
            }
            
            // Show preview with better formatting
            const preview = formatPreview(jsonData[0]);
            const confirmMsg = 
                `📥 Import ${jsonData.length} record(s) into database?\n\n` +
                `📋 Preview of first row:\n\n${preview}\n\n` +
                `⚠️ This action cannot be undone.`;
            
            if (!confirm(confirmMsg)) {
                event.target.value = '';
                return;
            }
            
            // Show loading overlay
            showLoadingOverlay(`Processing ${jsonData.length} records`, 'Uploading to database...');
            
            // Send to backend for bulk insert
            console.log('📤 Sending data to backend...');
            const response = await fetch(`${API_URL}/prospects/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prospects: jsonData })
            });
            
            console.log('📥 Response status:', response.status);
            const result = await response.json();
            console.log('📥 Response data:', result);
            
            // Remove loading overlay
            hideLoadingOverlay();
            
            if (result.success) {
                // Show detailed success message
                let message = `✅ SUCCESS!\n\nImported: ${result.stats.inserted} records`;
                
                if (result.partial) {
                    if (result.stats.duplicates > 0) {
                        message += `\nDuplicates skipped: ${result.stats.duplicates}`;
                    }
                    if (result.stats.failed > 0) {
                        message += `\nFailed: ${result.stats.failed}`;
                    }
                    if (result.stats.invalidRows > 0) {
                        message += `\nInvalid rows: ${result.stats.invalidRows}`;
                    }
                    
                    // Show duplicate details if available
                    if (result.duplicateDetails && result.duplicateDetails.length > 0) {
                        message += `\n\n📋 Sample duplicates:`;
                        result.duplicateDetails.slice(0, 3).forEach(dup => {
                            message += `\n- ${dup.name} (${dup.email})`;
                        });
                    }
                }
                
                message += `\n\nTable will refresh automatically.`;
                
                showNotification(message, result.partial ? 'warning' : 'success');
                
                // Refresh table to show new data
                console.log('🔄 Refreshing table data...');
                setTimeout(() => fetchProspects(), 1000);
            } else {
                // Show detailed error message
                let errorMsg = `❌ IMPORT FAILED\n\n${result.message}`;
                
                if (result.validationErrors && result.validationErrors.length > 0) {
                    errorMsg += `\n\n📋 Sample errors:`;
                    result.validationErrors.slice(0, 3).forEach(err => {
                        errorMsg += `\n- Row ${err.row}: ${err.message}`;
                    });
                }
                
                errorMsg += `\n\nPlease check:\n` +
                    `- Excel column names match expected format\n` +
                    `- Required fields are filled (Parent Name, Email, Phone)\n` +
                    `- Email format is valid\n` +
                    `- No duplicate entries`;
                
                showNotification(errorMsg, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error importing Excel:', error);
            hideLoadingOverlay();
            
            let errorMsg = `❌ ERROR\n\nFailed to import Excel file:\n${error.message}`;
            
            if (error.message.includes('fetch')) {
                errorMsg += `\n\n⚠️ Cannot connect to backend server.\nMake sure the server is running on port 5000.`;
            }
            
            showNotification(errorMsg, 'error');
        }
    };
    
    reader.onerror = function(error) {
        console.error('❌ FileReader error:', error);
        showNotification('❌ Failed to read file. Please try again.', 'error');
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    event.target.value = '';
}

// ========================================
// FETCH DATA FROM MONGODB - ENHANCED
// ========================================
async function fetchProspects() {
    if (isLoading) {
        console.log('⏭️ Already loading, skipping...');
        return;
    }
    
    isLoading = true;
    
    try {
        console.log('🔄 Fetching prospects from:', `${API_URL}/prospects`);
        
        // Show loading state in table
        const tbody = document.getElementById('tbody-ca1');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="15" style="text-align:center; padding:2rem; color:#666;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:1rem;">
                            <div class="spinner"></div>
                            <span>Loading data...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        const response = await fetch(`${API_URL}/prospects?limit=1000&sortBy=submittedAt&order=desc`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 API Response:', result);
        
        // Handle new API response format
        const data = result.data || result;
        
        if (!Array.isArray(data)) {
            console.error('❌ Response data is not an array:', data);
            throw new Error('Invalid response format: expected array');
        }
        
        console.log('📊 Data length:', data.length);
        
        // Transform data for table display
// Map data consistently with Excel headers
sampleData.ca1 = data.map(item => ({
    "Email": item.email || '-',
    "ParentName": `${item.parentFirstName || '-'} ${item.parentLastName || ''}`.trim(),
    "PhoneNumber": item.phoneNumber || '-',
    "ChildName": `${item.childFirstName || '-'} ${item.childLastName || ''}`.trim(),
    "DOB": formatDate(item.dateOfBirth),
    "Gender": capitalizeFirst(item.gender) || '-',
    "Diagnosis": item.diagnosis || '-',
    "ServiceInterestedIn": item.serviceInterested || '-',
    "InquiryType": item.inquiryType || '-',
    "PreferredDayforAppointment": item.preferredDay || '-',
    "PreferredTime": item.preferredTime || '-',
    "SourceOfYourInformation": item.sourceOfInformation || '-',
    "ReferrelName": item.referralName || '-',
    "ParentsConcern": item.parentsConcern || '-',
    "ConsentAgreement": item.consentAgreement || '-'
}));
        
        console.log('✅ Mapped data:', sampleData.ca1.length, 'records');
        
        // Populate table
        populateTable('ca1', sampleData.ca1);
        
        // Show success notification (only on manual refresh)
        if (window.manualRefresh) {
            showNotification(`✅ Loaded ${sampleData.ca1.length} prospects`, 'success', 2000);
            window.manualRefresh = false;
        }
        
        console.log(`✅ Successfully loaded ${sampleData.ca1.length} prospects from database`);
        
    } catch (error) {
        console.error('❌ Error fetching prospects:', error);
        
        const tbody = document.getElementById('tbody-ca1');
        if (tbody) {
            let errorMessage = '⚠️ Failed to load data from database';
            let errorDetail = error.message;
            
            if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
                errorMessage = '⚠️ Cannot connect to backend server';
                errorDetail = 'Make sure the server is running on http://localhost:5000';
            }
            
            tbody.innerHTML = `
                <tr>
                    <td colspan="15" style="text-align:center; padding:2rem;">
                        <div style="color:#e74c3c; font-size:1.2rem; margin-bottom:0.5rem;">
                            ${errorMessage}
                        </div>
                        <div style="color:#999; font-size:0.9rem; margin-bottom:1rem;">
                            ${errorDetail}
                        </div>
                        <button onclick="fetchProspects()" style="padding:0.5rem 1.5rem; background:#21537c; color:white; border:none; border-radius:4px; cursor:pointer;">
                            🔄 Retry
                        </button>
                    </td>
                </tr>
            `;
        }
        
        showNotification(`❌ ${error.message}`, 'error', 5000);
    } finally {
        isLoading = false;
    }
}

// ========================================
// POPULATE TABLE - ENHANCED
// ========================================
function populateTable(tableId, data) {
    const tbody = document.getElementById(`tbody-${tableId}`);
    if (!tbody) {
        console.error(`❌ Table body not found: tbody-${tableId}`);
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 20;
        td.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#999;">
                <div style="font-size:3rem; margin-bottom:1rem;">📭</div>
                <div style="font-size:1.2rem; margin-bottom:0.5rem;">No data available</div>
                <div style="font-size:0.9rem;">Import Excel file or submit a form to get started</div>
            </div>
        `;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.style.animation = `fadeIn 0.3s ease ${index * 0.02}s both`;
        
        Object.entries(row).forEach(([key, val]) => {
            // Skip internal fields like _id
            if (key.startsWith('_')) return;
            
            const td = document.createElement('td');
            
            // Apply styling based on value type
            if (key === 'Gender') {
                if (val === 'Male' || val === 'male') {
                    td.innerHTML = `<span class="badge badge-male">Male</span>`;
                } else if (val === 'Female' || val === 'female') {
                    td.innerHTML = `<span class="badge badge-female">Female</span>`;
                } else {
                    td.textContent = val || '-';
                }
            } else if (key === 'Status') {
                const statusClass = val.toLowerCase().replace(/\s+/g, '-');
                td.innerHTML = `<span class="badge badge-${statusClass}">${val}</span>`;
            } else if (key === 'Email') {
                td.innerHTML = val ? `<a href="mailto:${val}" style="color:#21537c;">${val}</a>` : '-';
            } else if (key === 'PhoneNumber') {
                td.innerHTML = val ? `<a href="tel:${val}" style="color:#21537c;">${val}</a>` : '-';
            } else {
                td.textContent = val || '-';
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    console.log(`✅ Table populated with ${data.length} rows`);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Format date to DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return '-';
    }
}

// Capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format preview for confirmation dialog
function formatPreview(row) {
    const keys = Object.keys(row).slice(0, 5);
    return keys.map(key => `${key}: ${row[key]}`).join('\n');
}

// Show loading overlay
function showLoadingOverlay(title, message) {
    const existing = document.getElementById('import-loading');
    if (existing) existing.remove();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'import-loading';
    loadingOverlay.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-card">
                <div class="spinner-large"></div>
                <h2>${title}</h2>
                <p>${message}</p>
                <p class="loading-subtext">Please wait, do not close this window</p>
            </div>
        </div>
        <style>
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .loading-card {
                background: white;
                padding: 3rem;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                text-align: center;
                max-width: 400px;
            }
            .loading-card h2 {
                color: #21537c;
                margin: 1rem 0 0.5rem 0;
            }
            .loading-card p {
                color: #666;
                font-size: 1.1rem;
                margin: 0.5rem 0;
            }
            .loading-subtext {
                color: #999 !important;
                font-size: 0.9rem !important;
                margin-top: 1rem !important;
            }
            .spinner-large {
                width: 50px;
                height: 50px;
                border: 4px solid #e0e0e0;
                border-top: 4px solid #21537c;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            .spinner {
                width: 20px;
                height: 20px;
                border: 3px solid #e0e0e0;
                border-top: 3px solid #21537c;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    `;
    document.body.appendChild(loadingOverlay);
}

// Hide loading overlay
function hideLoadingOverlay() {
    const loadingEl = document.getElementById('import-loading');
    if (loadingEl) loadingEl.remove();
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: white;
        padding: 1rem 1.5rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-left: 4px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        white-space: pre-line;
        animation: slideIn 0.3s ease;
        cursor: pointer;
    `;
    
    notification.textContent = message;
    
    // Add click to dismiss
    notification.onclick = () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    };
    
    container.appendChild(notification);
    
    // Auto dismiss
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    // Add animation styles if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// TABLE FUNCTIONS
// ========================================

// Toggle column filter dropdown
function toggleColumnFilter(tableId) {
    const filter = document.getElementById(`column-filter-${tableId}`);
    const allFilters = document.querySelectorAll('.column-filter');
    allFilters.forEach(f => {
        if (f.id !== `column-filter-${tableId}`) f.style.display = 'none';
    });
    filter.style.display = filter.style.display === 'none' ? 'flex' : 'none';
}

// Toggle column visibility
function toggleColumn(tableId, colIndex) {
    const table = document.getElementById(`table-${tableId}`);
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cells = row.children;
        if (cells[colIndex]) {
            cells[colIndex].style.display = cells[colIndex].style.display === 'none' ? '' : 'none';
        }
    });
}

// Search table rows
function searchTable(tableId) {
    const input = document.getElementById(`search-${tableId}`);
    const filter = input.value.toLowerCase();
    const table = document.getElementById(`table-${tableId}`);
    const rows = table.querySelectorAll('tbody tr');
    
    let visibleCount = 0;
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(filter);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    console.log(`🔍 Search results: ${visibleCount} of ${rows.length} rows`);
}

// Close filters when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.filter-bar') && !e.target.closest('.column-filter')) {
        document.querySelectorAll('.column-filter').forEach(f => f.style.display = 'none');
    }
});

// Export to Excel
function exportToExcel(tableId) {
    const table = document.getElementById(`table-${tableId}`);
    let csv = [];
    
    // Get headers
    const headers = Array.from(table.querySelectorAll('thead th'))
        .filter(th => th.style.display !== 'none')
        .map(th => th.textContent.trim());
    csv.push(headers.join(','));
    
    // Get rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const cols = Array.from(row.querySelectorAll('td'))
                .filter((td, i) => {
                    const th = table.querySelectorAll('thead th')[i];
                    return th && th.style.display !== 'none';
                })
                .map(td => {
                    let text = td.textContent.trim();
                    // Escape commas and quotes
                    if (text.includes(',') || text.includes('"')) {
                        text = `"${text.replace(/"/g, '""')}"`;
                    }
                    return text;
                });
            csv.push(cols.join(','));
        }
    });
    
    // Download CSV
    const csvContent = '\uFEFF' + csv.join('\n'); // Add BOM for Excel UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `IdzmirKidsHub_${tableId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Data exported successfully', 'success', 3000);
}

// ========================================
// SECTION NAVIGATION
// ========================================
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById(sectionName + '-section').classList.add('active');
    
    if (sectionName === 'creative-team') {
        document.getElementById('tab-creative').classList.add('active');
    } else if (sectionName === 'customer-care') {
        document.getElementById('tab-customer-care').classList.add('active');
    } else if (sectionName === 'customer-acquisition') {
        document.getElementById('tab-acquisition').classList.add('active');
        fetchProspects();
    }
}

// ========================================
// FORM FUNCTIONS
// ========================================

// Export form
function exportForm(e, formKey) {
    e.stopPropagation();
    const formPath = formPaths[formKey];
    if (!formPath) {
        showNotification('❌ Form not found', 'error');
        return;
    }
    const printWindow = window.open(formPath, '_blank', 'width=800,height=600');
    if (printWindow) {
        printWindow.onload = function() {
            setTimeout(function() { printWindow.print(); }, 500);
        };
    } else {
        showNotification('❌ Please allow pop-ups to export the form', 'error');
    }
}

// View form modal
function viewForm(formKey) {
    const modal = document.getElementById('form-modal');
    const iframe = document.getElementById('form-iframe');
    const formPath = formPaths[formKey];
    if (!formPath) {
        showNotification('❌ Form not found', 'error');
        return;
    }
    iframe.src = formPath;
    modal.style.display = 'flex';
    
    // Listen for form submission to refresh data
    window.addEventListener('message', (event) => {
        if (event.data === 'formSubmitted') {
            showNotification('✅ Form submitted successfully!', 'success');
            setTimeout(() => {
                fetchProspects();
                closeFormModal();
            }, 1000);
        }
    });
}

function closeFormModal() {
    document.getElementById('form-modal').style.display = 'none';
    document.getElementById('form-iframe').src = '';
}

// Modal event listeners
document.getElementById('form-modal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeFormModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        closeFormModal();
    }
});

// ========================================
// REFRESH DATA
// ========================================
function refreshData() {
    console.log('🔄 Manual refresh triggered');
    window.manualRefresh = true;
    fetchProspects();
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Idzmir Kids Hub Dashboard Initialized');
    console.log('📅 Current date:', new Date().toLocaleString());
    
    // Initial data load
    fetchProspects();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (!isLoading) {
            console.log('⏰ Auto-refresh triggered');
            fetchProspects();
        }
    }, 30000);
    
    console.log('⏱️ Auto-refresh enabled (every 30 seconds)');
    showNotification('✅ Dashboard loaded successfully', 'success', 3000);
});