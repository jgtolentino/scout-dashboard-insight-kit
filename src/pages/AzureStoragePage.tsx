import { AzureStorageExample } from '../components/AzureStorageExample';

export function AzureStoragePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Azure Storage Demo</h1>
        <p className="text-gray-600">
          Test your Azure Storage integration with file upload, download, and management operations.
        </p>
      </div>
      <AzureStorageExample />
    </div>
  );
}

export default AzureStoragePage;
