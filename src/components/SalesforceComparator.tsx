import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RecordData {
  id: string;
  objectType: string;
  fields: Record<string, any>;
  orgUrl: string;
  recordName?: string;
}

interface ComparisonResult {
  different: Array<{ field: string; source: any; target: any }>;
  same: Array<{ field: string; value: any }>;
  sourceOnly: Array<{ field: string; value: any }>;
  targetOnly: Array<{ field: string; value: any }>;
}

const SalesforceComparator = () => {
  const [sourceRecord, setSourceRecord] = useState<RecordData | null>(null);
  const [targetRecord, setTargetRecord] = useState<RecordData | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load stored records on mount
    loadStoredRecords();
    
    // Get current tab info
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          setCurrentTab(tabs[0].url);
        }
      });
    }
  }, []);

  const loadStoredRecords = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['sourceRecord', 'targetRecord']);
        if (result.sourceRecord) {
          setSourceRecord(result.sourceRecord);
        }
        if (result.targetRecord) {
          setTargetRecord(result.targetRecord);
        }
      }
    } catch (err) {
      console.error('Error loading stored records:', err);
    }
  };

  const selectSourceRecord = async () => {
    setIsLoadingSource(true);
    setError('');
    
    try {
      if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
        throw new Error('Chrome extension APIs not available');
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: extractRecordInfo
      });

      if (result[0]?.result) {
        const recordInfo = result[0].result;
        
        const recordData = await fetchRecordData(recordInfo);
        
        setSourceRecord(recordData);
        if (chrome.storage) {
          await chrome.storage.local.set({ sourceRecord: recordData });
        }
      } else {
        setError('Could not detect Salesforce record on this page');
      }
    } catch (err) {
      setError('Error selecting source record: ' + (err as Error).message);
    } finally {
      setIsLoadingSource(false);
    }
  };

  const selectTargetRecord = async () => {
    setIsLoadingTarget(true);
    setError('');
    
    try {
      if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
        throw new Error('Chrome extension APIs not available');
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: extractRecordInfo
      });

      if (result[0]?.result) {
        const recordInfo = result[0].result;
        
        const recordData = await fetchRecordData(recordInfo);
        
        setTargetRecord(recordData);
        if (chrome.storage) {
          await chrome.storage.local.set({ targetRecord: recordData });
        }
      } else {
        setError('Could not detect Salesforce record on this page');
      }
    } catch (err) {
      setError('Error selecting target record: ' + (err as Error).message);
    } finally {
      setIsLoadingTarget(false);
    }
  };

  const compareRecords = () => {
    if (!sourceRecord || !targetRecord) {
      setError('Please select both source and target records');
      return;
    }

    if (sourceRecord.objectType !== targetRecord.objectType) {
      setError('Records must be of the same object type to compare');
      return;
    }

    const result: ComparisonResult = {
      different: [],
      same: [],
      sourceOnly: [],
      targetOnly: []
    };

    const sourceFields = new Set(Object.keys(sourceRecord.fields));
    const targetFields = new Set(Object.keys(targetRecord.fields));
    const allFields = new Set([...sourceFields, ...targetFields]);

    allFields.forEach(field => {
      const sourceValue = sourceRecord.fields[field];
      const targetValue = targetRecord.fields[field];

      if (sourceFields.has(field) && targetFields.has(field)) {
        if (JSON.stringify(sourceValue) === JSON.stringify(targetValue)) {
          result.same.push({ field, value: sourceValue });
        } else {
          result.different.push({ field, source: sourceValue, target: targetValue });
        }
      } else if (sourceFields.has(field) && !targetFields.has(field)) {
        result.sourceOnly.push({ field, value: sourceValue });
      } else if (!sourceFields.has(field) && targetFields.has(field)) {
        result.targetOnly.push({ field, value: targetValue });
      }
    });

    setComparison(result);
    setError('');
  };

  const clearRecords = async () => {
    setSourceRecord(null);
    setTargetRecord(null);
    setComparison(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.remove(['sourceRecord', 'targetRecord']);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const isSalesforceTab = currentTab.includes('salesforce.com') || 
                         currentTab.includes('force.com') || 
                         currentTab.includes('lightning.force.com');

  return (
    <div className="w-96 p-4 space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-2">Salesforce Record Comparator</h1>
        {!isSalesforceTab && (
          <Alert>
            <AlertDescription>
              Please navigate to a Salesforce page to select records
            </AlertDescription>
          </Alert>
        )}
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Source Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sourceRecord ? (
              <div className="text-xs space-y-1">
                <div><strong>ID:</strong> {sourceRecord.id}</div>
                <div><strong>Type:</strong> {sourceRecord.objectType}</div>
                <div><strong>Name:</strong> {sourceRecord.recordName || 'N/A'}</div>
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(sourceRecord.fields).length} fields
                </Badge>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No source record selected</div>
            )}
            <Button 
              onClick={selectSourceRecord} 
              disabled={!isSalesforceTab || isLoadingSource}
              size="sm"
              className="w-full"
            >
              {isLoadingSource ? 'Loading...' : 'Select Source Record'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Target Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {targetRecord ? (
              <div className="text-xs space-y-1">
                <div><strong>ID:</strong> {targetRecord.id}</div>
                <div><strong>Type:</strong> {targetRecord.objectType}</div>
                <div><strong>Name:</strong> {targetRecord.recordName || 'N/A'}</div>
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(targetRecord.fields).length} fields
                </Badge>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No target record selected</div>
            )}
            <Button 
              onClick={selectTargetRecord} 
              disabled={!isSalesforceTab || isLoadingTarget}
              size="sm"
              className="w-full"
            >
              {isLoadingTarget ? 'Loading...' : 'Select Target Record'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={compareRecords} 
          disabled={!sourceRecord || !targetRecord}
          className="flex-1"
        >
          Compare Records
        </Button>
        <Button onClick={clearRecords} variant="outline" size="sm">
          Clear
        </Button>
      </div>

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="different" className="w-full">
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="different">
                  Different ({comparison.different.length})
                </TabsTrigger>
                <TabsTrigger value="same">
                  Same ({comparison.same.length})
                </TabsTrigger>
                <TabsTrigger value="source">
                  Source Only ({comparison.sourceOnly.length})
                </TabsTrigger>
                <TabsTrigger value="target">
                  Target Only ({comparison.targetOnly.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="different" className="space-y-2 max-h-64 overflow-y-auto">
                {comparison.different.map((item, index) => (
                  <div key={index} className="border rounded p-2 text-xs">
                    <div className="font-medium mb-1">{item.field}</div>
                    <div className="space-y-1">
                      <div className="bg-red-50 p-1 rounded">
                        <strong>Source:</strong> {formatValue(item.source)}
                      </div>
                      <div className="bg-green-50 p-1 rounded">
                        <strong>Target:</strong> {formatValue(item.target)}
                      </div>
                    </div>
                  </div>
                ))}
                {comparison.different.length === 0 && (
                  <div className="text-muted-foreground text-xs">No different fields</div>
                )}
              </TabsContent>

              <TabsContent value="same" className="space-y-2 max-h-64 overflow-y-auto">
                {comparison.same.map((item, index) => (
                  <div key={index} className="border rounded p-2 text-xs">
                    <div className="font-medium mb-1">{item.field}</div>
                    <div className="bg-gray-50 p-1 rounded">
                      {formatValue(item.value)}
                    </div>
                  </div>
                ))}
                {comparison.same.length === 0 && (
                  <div className="text-muted-foreground text-xs">No matching fields</div>
                )}
              </TabsContent>

              <TabsContent value="source" className="space-y-2 max-h-64 overflow-y-auto">
                {comparison.sourceOnly.map((item, index) => (
                  <div key={index} className="border rounded p-2 text-xs">
                    <div className="font-medium mb-1">{item.field}</div>
                    <div className="bg-blue-50 p-1 rounded">
                      {formatValue(item.value)}
                    </div>
                  </div>
                ))}
                {comparison.sourceOnly.length === 0 && (
                  <div className="text-muted-foreground text-xs">No source-only fields</div>
                )}
              </TabsContent>

              <TabsContent value="target" className="space-y-2 max-h-64 overflow-y-auto">
                {comparison.targetOnly.map((item, index) => (
                  <div key={index} className="border rounded p-2 text-xs">
                    <div className="font-medium mb-1">{item.field}</div>
                    <div className="bg-yellow-50 p-1 rounded">
                      {formatValue(item.value)}
                    </div>
                  </div>
                ))}
                {comparison.targetOnly.length === 0 && (
                  <div className="text-muted-foreground text-xs">No target-only fields</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper functions that will be injected into the page
const extractRecordInfo = () => {
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
                       document.querySelector('[data-testid="slds-page-header__title"]');
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
    
    // Try to determine object type from URL patterns
    if (url.includes('/001')) objectType = 'Account';
    else if (url.includes('/003')) objectType = 'Contact';
    else if (url.includes('/006')) objectType = 'Opportunity';
    else if (url.includes('/00Q')) objectType = 'Lead';
    else if (url.includes('/500')) objectType = 'Case';
    
    // Try to get record name from page
    const nameElement = document.querySelector('.pageDescription') || 
                       document.querySelector('h1.noSecondHeader') ||
                       document.querySelector('.bPageTitle');
    if (nameElement) {
      recordName = nameElement.textContent?.trim() || '';
    }
  }

  if (!recordId) {
    throw new Error('Could not extract record ID from current page');
  }

  return {
    recordId,
    objectType,
    recordName,
    orgUrl: window.location.origin
  };
};

const fetchRecordData = async (recordInfo: any): Promise<RecordData> => {
  // This would need to be implemented with actual Salesforce API calls
  // For now, return mock data structure
  return {
    id: recordInfo.recordId,
    objectType: recordInfo.objectType,
    recordName: recordInfo.recordName,
    orgUrl: recordInfo.orgUrl,
    fields: {
      Id: recordInfo.recordId,
      Name: recordInfo.recordName,
      // Additional fields would be fetched from Salesforce API
    }
  };
};

export default SalesforceComparator;
