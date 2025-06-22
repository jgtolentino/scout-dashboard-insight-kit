// Example component demonstrating Azure Storage usage
// This shows how to use the single connection string approach

import React, { useState } from 'react';
import { azureStorageService } from '../services/azureStorageService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, Download, List, Trash2 } from 'lucide-react';

export function AzureStorageExample() {
  const [file, setFile] = useState<File | null>(null);
  const [containerName, setContainerName] = useState('test-container');
  const [blobs, setBlobs] = useState<Array<{ name: string; url: string; size?: number }>>([]);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const accountInfo = azureStorageService.getAccountInfo();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file first');
      return;
    }

    setIsLoading(true);
    setStatus('Uploading...');

    try {
      const url = await azureStorageService.uploadBlob({
        containerName,
        blobName: file.name,
        data: file,
        contentType: file.type,
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      });

      setStatus(`✅ File uploaded successfully! URL: ${url}`);
      // Refresh the blob list
      await handleListBlobs();
    } catch (error) {
      setStatus(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListBlobs = async () => {
    setIsLoading(true);
    setStatus('Listing blobs...');

    try {
      const blobList = await azureStorageService.listBlobs({
        containerName,
        maxResults: 10
      });

      setBlobs(blobList);
      setStatus(`✅ Found ${blobList.length} blobs`);
    } catch (error) {
      setStatus(`❌ List failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setBlobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (blobName: string) => {
    setIsLoading(true);
    setStatus(`Downloading ${blobName}...`);

    try {
      const blob = await azureStorageService.downloadBlob({
        containerName,
        blobName
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = blobName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus(`✅ Downloaded ${blobName}`);
    } catch (error) {
      setStatus(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (blobName: string) => {
    if (!confirm(`Are you sure you want to delete ${blobName}?`)) {
      return;
    }

    setIsLoading(true);
    setStatus(`Deleting ${blobName}...`);

    try {
      await azureStorageService.deleteBlob({
        containerName,
        blobName
      });

      setStatus(`✅ Deleted ${blobName}`);
      // Refresh the blob list
      await handleListBlobs();
    } catch (error) {
      setStatus(`❌ Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!accountInfo.isConfigured) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Azure Storage Not Configured</CardTitle>
          <CardDescription>
            Please configure your Azure Storage connection string in the environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Add the following to your <code>.env.local</code> file:
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm">
{`VITE_STORAGE_ACCOUNT=projectscoutdata
VITE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=projectscoutdata;AccountKey=...;EndpointSuffix=core.windows.net"`}
              </pre>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Azure Storage Demo</CardTitle>
        <CardDescription>
          Connected to storage account: <strong>{accountInfo.accountName}</strong>
          <br />
          Using single connection string for all storage services (Blob, File, Queue, Table, Data Lake Gen2)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Container Name Input */}
        <div className="space-y-2">
          <label htmlFor="container" className="text-sm font-medium">
            Container Name
          </label>
          <Input
            id="container"
            value={containerName}
            onChange={(e) => setContainerName(e.target.value)}
            placeholder="Enter container name"
          />
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload File</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                type="file"
                onChange={handleFileSelect}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </div>

        {/* Blob List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Blobs in Container</h3>
            <Button
              onClick={handleListBlobs}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {blobs.length > 0 ? (
            <div className="space-y-2">
              {blobs.map((blob) => (
                <div
                  key={blob.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{blob.name}</div>
                    <div className="text-sm text-gray-500">
                      {blob.size ? `${(blob.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(blob.name)}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(blob.name)}
                      disabled={isLoading}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No blobs found. Upload a file or click Refresh to check again.
            </div>
          )}
        </div>

        {/* Status Display */}
        {status && (
          <Alert>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AzureStorageExample;
