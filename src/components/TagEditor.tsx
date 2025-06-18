import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Tag {
  tag_key: string;
  tag_value: string;
  source: string;
}

interface Region {
  region_index: number;
  feature_name: string;
  feature_value: number;
  tags: Tag[];
}

interface Asset {
  asset_id: string;
  campaign_id: string;
  file_name: string;
  file_type: string;
  ingest_timestamp: string;
  regions: Region[];
}

interface Campaign {
  campaign_id: string;
  last_updated: string;
  metrics: Array<{
    metric_name: string;
    metric_value: number;
  }>;
}

export function TagEditor() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [newTagKey, setNewTagKey] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchAssets(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async (campaignId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assets?campaign_id=${campaignId}`);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = async () => {
    if (!selectedAsset || !selectedRegion || !newTagKey.trim() || !newTagValue.trim()) return;
    
    try {
      const response = await fetch(`/api/assets/${selectedAsset.asset_id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region_index: selectedRegion.region_index,
          tag: {
            tag_key: newTagKey,
            tag_value: newTagValue,
            source: 'human'
          }
        })
      });
      
      if (response.ok) {
        await fetchAssets(selectedCampaign);
        setNewTagKey('');
        setNewTagValue('');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Metadata Tagging</h2>
        
        {/* Campaign Selector */}
        <div className="mb-6">
          <Label>Select Campaign</Label>
          <Select
            value={selectedCampaign}
            onValueChange={setSelectedCampaign}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.campaign_id} (Last updated: {new Date(campaign.last_updated).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Asset List */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Assets</h3>
            <ScrollArea className="h-[400px] border rounded-md p-2">
              {assets.map((asset) => (
                <div
                  key={asset.asset_id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedAsset?.asset_id === asset.asset_id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setSelectedRegion(null);
                  }}
                >
                  <div className="font-medium">{asset.file_name}</div>
                  <div className="text-sm text-gray-500">{asset.file_type}</div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Region & Tag Editor */}
          <div>
            {selectedAsset ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Regions for {selectedAsset.file_name}</h3>
                <div className="space-y-4">
                  {/* Region Selector */}
                  <div>
                    <Label>Select Region</Label>
                    <Select
                      value={selectedRegion?.region_index.toString()}
                      onValueChange={(value) => {
                        const region = selectedAsset.regions.find(
                          r => r.region_index.toString() === value
                        );
                        setSelectedRegion(region || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedAsset.regions.map((region) => (
                          <SelectItem
                            key={region.region_index}
                            value={region.region_index.toString()}
                          >
                            Region {region.region_index} ({region.feature_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tag Editor */}
                  {selectedRegion && (
                    <>
                      <div className="space-y-2">
                        <Label>Add New Tag</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newTagKey}
                            onChange={(e) => setNewTagKey(e.target.value)}
                            placeholder="Tag key..."
                          />
                          <Input
                            value={newTagValue}
                            onChange={(e) => setNewTagValue(e.target.value)}
                            placeholder="Tag value..."
                          />
                          <Button onClick={handleTagAdd}>
                            Add Tag
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Existing Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedRegion.tags.map((tag) => (
                            <Badge key={`${tag.tag_key}-${tag.tag_value}`} variant="secondary">
                              {tag.tag_key}: {tag.tag_value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                Select an asset to manage its regions and tags
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 