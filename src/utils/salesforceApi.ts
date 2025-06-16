
// Utility functions for Salesforce API integration
export interface RecordInfo {
  recordId: string;
  objectType: string;
  recordName: string;
  orgUrl: string;
  fullUrl?: string;
}

export interface FieldMetadata {
  name: string;
  type: string;
  label: string;
  updateable: boolean;
  createable: boolean;
}

export class SalesforceApiClient {
  private sessionId: string | null = null;
  private instanceUrl: string | null = null;

  async getSessionInfo(): Promise<{ sessionId: string; instanceUrl: string }> {
    // Extract session ID and instance URL from current Salesforce page
    // This would typically be done by injecting a script that accesses
    // the Salesforce session information from the page context
    
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
          reject(new Error('No active tab found'));
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id! },
          func: () => {
            // Extract session information from Salesforce page
            try {
              // For Lightning Experience
              if (window.location.href.includes('lightning')) {
                // @ts-ignore - Salesforce global objects
                const sfdcPage = window.$A || window.sforce;
                if (sfdcPage) {
                  return {
                    sessionId: 'mock_session_id', // Would extract real session ID
                    instanceUrl: window.location.origin
                  };
                }
              }
              
              // For Classic
              else {
                // @ts-ignore - Salesforce global objects  
                const sforce = window.sforce;
                if (sforce && sforce.connection) {
                  return {
                    sessionId: sforce.connection.sessionId,
                    instanceUrl: window.location.origin
                  };
                }
              }
              
              throw new Error('Could not extract Salesforce session information');
            } catch (error) {
              throw new Error('Failed to get session info: ' + error.message);
            }
          }
        }, (results) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          if (results && results[0] && results[0].result) {
            const { sessionId, instanceUrl } = results[0].result;
            this.sessionId = sessionId;
            this.instanceUrl = instanceUrl;
            resolve({ sessionId, instanceUrl });
          } else {
            reject(new Error('Failed to extract session information'));
          }
        });
      });
    });
  }

  async describeObject(objectType: string): Promise<FieldMetadata[]> {
    if (!this.sessionId || !this.instanceUrl) {
      await this.getSessionInfo();
    }

    const response = await fetch(`${this.instanceUrl}/services/data/v58.0/sobjects/${objectType}/describe`, {
      headers: {
        'Authorization': `Bearer ${this.sessionId}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to describe object: ${response.statusText}`);
    }

    const data = await response.json();
    return data.fields.map((field: any) => ({
      name: field.name,
      type: field.type,
      label: field.label,
      updateable: field.updateable,
      createable: field.createable
    }));
  }

  async queryRecord(objectType: string, recordId: string): Promise<Record<string, any>> {
    if (!this.sessionId || !this.instanceUrl) {
      await this.getSessionInfo();
    }

    // Get all fields for the object
    const fields = await this.describeObject(objectType);
    const fieldNames = fields.map(f => f.name).join(',');

    const query = `SELECT ${fieldNames} FROM ${objectType} WHERE Id = '${recordId}'`;
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `${this.instanceUrl}/services/data/v58.0/query?q=${encodedQuery}`,
      {
        headers: {
          'Authorization': `Bearer ${this.sessionId}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to query record: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      return data.records[0];
    } else {
      throw new Error('Record not found');
    }
  }
}

export const salesforceApi = new SalesforceApiClient();
