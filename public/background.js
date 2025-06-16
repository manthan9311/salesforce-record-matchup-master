
// Background script for the Chrome extension
console.log('Salesforce Record Comparator background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Salesforce Record Comparator extension installed');
});

// Listen for tab updates to detect Salesforce pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isSalesforce = tab.url.includes('salesforce.com') || 
                        tab.url.includes('force.com') || 
                        tab.url.includes('lightning.force.com');
    
    if (isSalesforce) {
      // Inject content script if needed
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => {
        // Content script might already be injected
        console.log('Content script injection skipped:', err.message);
      });
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchRecordData') {
    fetchSalesforceRecord(request.recordInfo)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function fetchSalesforceRecord(recordInfo) {
  // This is a placeholder for the actual Salesforce API integration
  // In a real implementation, you would:
  // 1. Get the session ID from the current Salesforce page
  // 2. Make REST API calls to describe the object and get field metadata
  // 3. Query all fields for the specific record
  // 4. Return the complete record data
  
  try {
    // For demonstration, return mock data structure
    // In production, this would make actual API calls
    const mockFieldData = {
      Id: recordInfo.recordId,
      Name: recordInfo.recordName || 'Sample Record',
      CreatedDate: '2024-01-15T10:30:00.000+0000',
      LastModifiedDate: '2024-01-16T14:20:00.000+0000',
      OwnerId: '0051234567890ABC',
      // Add more fields based on object type
    };

    // Add object-specific fields
    if (recordInfo.objectType === 'Account') {
      mockFieldData.Type = 'Customer';
      mockFieldData.Industry = 'Technology';
      mockFieldData.Phone = '555-0123';
      mockFieldData.Website = 'https://example.com';
    } else if (recordInfo.objectType === 'Contact') {
      mockFieldData.Email = 'contact@example.com';
      mockFieldData.Phone = '555-0124';
      mockFieldData.Title = 'Manager';
    } else if (recordInfo.objectType === 'Opportunity') {
      mockFieldData.Amount = 50000;
      mockFieldData.StageName = 'Qualification';
      mockFieldData.CloseDate = '2024-03-15';
    }

    return {
      id: recordInfo.recordId,
      objectType: recordInfo.objectType,
      recordName: recordInfo.recordName,
      orgUrl: recordInfo.orgUrl,
      fields: mockFieldData
    };
  } catch (error) {
    throw new Error('Failed to fetch record data: ' + error.message);
  }
}
