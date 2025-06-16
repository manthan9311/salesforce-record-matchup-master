
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Salesforce Record Comparator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A powerful Chrome extension to compare Salesforce records across Classic and Lightning interfaces
          </p>
          <Badge variant="secondary" className="text-sm">
            Chrome Extension v1.0
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Cross-Interface Support:</strong> Works with both Salesforce Classic and Lightning Experience
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Smart Record Detection:</strong> Automatically extracts record IDs from URLs and page content
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Comprehensive Comparison:</strong> Shows different, same, and unique fields between records
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Cross-Org Support:</strong> Compare records from different Salesforce organizations
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="font-medium">1. Install the Extension</div>
                <p className="text-sm text-gray-600">
                  Load the extension in Chrome Developer mode
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium">2. Select Source Record</div>
                <p className="text-sm text-gray-600">
                  Navigate to a Salesforce record and click "Select Source Record"
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium">3. Select Target Record</div>
                <p className="text-sm text-gray-600">
                  Go to another record (same object type) and select it as target
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium">4. Compare</div>
                <p className="text-sm text-gray-600">
                  Click "Compare Records" to see the detailed comparison
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Installation Instructions:</strong> This is a Chrome extension project. 
            To use it, you'll need to load it as an unpacked extension in Chrome's Developer mode. 
            The extension files are generated in the public folder.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Technical Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Record Detection</h4>
                <p className="text-sm text-gray-600">
                  Automatically detects record IDs from Lightning and Classic URLs
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">API Integration</h4>
                <p className="text-sm text-gray-600">
                  Uses Salesforce REST API to fetch complete record data
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Local Storage</h4>
                <p className="text-sm text-gray-600">
                  Stores selected records locally for easy comparison
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Comparison Views</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800">Different Fields</h3>
              <p className="text-sm text-red-600">
                Fields with different values between records
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800">Same Fields</h3>
              <p className="text-sm text-green-600">
                Fields with identical values
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800">Source Only</h3>
              <p className="text-sm text-blue-600">
                Fields present only in source record
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800">Target Only</h3>
              <p className="text-sm text-yellow-600">
                Fields present only in target record
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Compare Records?</h2>
            <p className="mb-6">
              Install the Chrome extension and start comparing your Salesforce records today!
            </p>
            <Button variant="secondary" size="lg">
              Load Extension in Chrome
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
