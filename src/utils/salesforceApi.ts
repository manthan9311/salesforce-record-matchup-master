
// Utility functions for Salesforce API integration

export interface SalesforceRecord {
  Id: string;
  attributes: {
    type: string;
    url: string;
  };
  [key: string]: any;
}

export interface RecordInfo {
  recordId: string;
  objectType: string;
  recordName?: string;
  orgUrl: string;
}

export const getSalesforceSessionId = async (): Promise<string | null> => {
  try {
    // In a real implementation, this would extract the session ID from the current Salesforce page
    // For demo purposes, return null to use mock data
    return null;
  } catch (error) {
    console.error('Error getting Salesforce session ID:', error);
    return null;
  }
};

export const fetchRecordData = async (recordInfo: RecordInfo): Promise<any> => {
  try {
    const sessionId = await getSalesforceSessionId();
    
    if (!sessionId) {
      // Return mock data for demonstration
      return getMockRecordData(recordInfo);
    }

    // In a real implementation, this would make actual Salesforce REST API calls
    const response = await fetch(`${recordInfo.orgUrl}/services/data/v58.0/sobjects/${recordInfo.objectType}/${recordInfo.recordId}`, {
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response into our expected format
    return {
      id: data.Id,
      objectType: recordInfo.objectType,
      recordName: data.Name || recordInfo.recordName,
      orgUrl: recordInfo.orgUrl,
      fields: data
    };
  } catch (error) {
    console.error('Error fetching record data:', error);
    // Fallback to mock data
    return getMockRecordData(recordInfo);
  }
};

const getMockRecordData = (recordInfo: RecordInfo) => {
  const mockFieldData: Record<string, any> = {
    Id: recordInfo.recordId,
    Name: recordInfo.recordName || 'Sample Record',
    CreatedDate: '2024-01-15T10:30:00.000+0000',
    LastModifiedDate: '2024-01-16T14:20:00.000+0000',
    OwnerId: '0051234567890ABC',
  };

  // Add object-specific fields
  if (recordInfo.objectType === 'Account') {
    mockFieldData.Type = 'Customer';
    mockFieldData.Industry = 'Technology';
    mockFieldData.Phone = '555-0123';
    mockFieldData.Website = 'https://example.com';
    mockFieldData.BillingCity = 'San Francisco';
    mockFieldData.BillingState = 'CA';
  } else if (recordInfo.objectType === 'Contact') {
    mockFieldData.Email = 'contact@example.com';
    mockFieldData.Phone = '555-0124';
    mockFieldData.Title = 'Manager';
    mockFieldData.Department = 'Sales';
  } else if (recordInfo.objectType === 'Opportunity') {
    mockFieldData.Amount = 50000;
    mockFieldData.StageName = 'Qualification';
    mockFieldData.CloseDate = '2024-03-15';
    mockFieldData.Probability = 25;
  }

  return {
    id: recordInfo.recordId,
    objectType: recordInfo.objectType,
    recordName: recordInfo.recordName,
    orgUrl: recordInfo.orgUrl,
    fields: mockFieldData
  };
};

export const describeObject = async (objectType: string, orgUrl: string, sessionId: string): Promise<any> => {
  try {
    const response = await fetch(`${orgUrl}/services/data/v58.0/sobjects/${objectType}/describe`, {
      headers: {
        'Authorization': `Bearer ${sessionId}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error describing object:', error);
    throw error;
  }
};
