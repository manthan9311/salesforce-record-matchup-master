
// Content script to interact with Salesforce pages
console.log('Salesforce Record Comparator content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRecordInfo') {
    try {
      const recordInfo = extractRecordInfo();
      sendResponse({ success: true, data: recordInfo });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep message channel open for async response
});

function extractRecordInfo() {
  const url = window.location.href;
  let recordId = '';
  let objectType = '';
  let recordName = '';

  // Extract from Lightning Experience
  if (url.includes('lightning.force.com') || url.includes('/lightning/')) {
    const lightningMatch = url.match(/\/lightning\/r\/(\w+)\/(\w{15,18})/);
    if (lightningMatch) {
      objectType = lightningMatch[1];
      recordId = lightningMatch[2];
    }
    
    // Try to get record name from page title or header
    const nameElement = document.querySelector('h1[data-aura-class="uiOutputText"]') || 
                       document.querySelector('.slds-page-header__title') ||
                       document.querySelector('[data-testid="slds-page-header__title"]') ||
                       document.querySelector('lightning-formatted-text[data-output-element-id="output-field"]');
    if (nameElement) {
      recordName = nameElement.textContent?.trim() || '';
    }
  }
  
  // Extract from Salesforce Classic
  else if (url.includes('salesforce.com') && !url.includes('lightning')) {
    const classicMatch = url.match(/\/(\w{15,18})(?:\?|$|\/)/);
    if (classicMatch) {
      recordId = classicMatch[1];
    }
    
    // Determine object type from record ID prefix
    const idPrefix = recordId.substring(0, 3);
    const objectMap = {
      '001': 'Account',
      '003': 'Contact', 
      '006': 'Opportunity',
      '00Q': 'Lead',
      '500': 'Case',
      '0Q0': 'Quote',
      '701': 'Campaign',
      '00T': 'Task',
      '00U': 'Event'
    };
    objectType = objectMap[idPrefix] || 'Unknown';
    
    // Try to get record name from page
    const nameElement = document.querySelector('.pageDescription') || 
                       document.querySelector('h1.noSecondHeader') ||
                       document.querySelector('.bPageTitle') ||
                       document.querySelector('h2.mainTitle');
    if (nameElement) {
      recordName = nameElement.textContent?.trim() || '';
    }
  }

  if (!recordId) {
    throw new Error('Could not extract record ID from current page. Please make sure you are on a Salesforce record page.');
  }

  return {
    recordId,
    objectType,
    recordName,
    orgUrl: window.location.origin,
    fullUrl: window.location.href
  };
}

// Add visual indicator when extension is active
function addExtensionIndicator() {
  if (document.getElementById('sf-comparator-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'sf-comparator-indicator';
  indicator.innerHTML = '🔍 SF Comparator Active';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #1976d2;
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(indicator);
  
  // Remove indicator after 3 seconds
  setTimeout(() => {
    indicator.remove();
  }, 3000);
}

// Show indicator when page loads
if (window.location.href.includes('salesforce.com') || 
    window.location.href.includes('force.com')) {
  addExtensionIndicator();
}
