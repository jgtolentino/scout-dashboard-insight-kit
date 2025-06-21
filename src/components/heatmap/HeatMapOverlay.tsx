import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface HeatMapOverlayProps {
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

const HeatMapOverlay: React.FC<HeatMapOverlayProps> = ({ 
  visible, 
  onVisibilityChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(0.6);
  const [data, setData] = useState<number[][]>([]);
  
  // Generate mock heat map data (32x32 grid)
  useEffect(() => {
    const generateHeatMapData = () => {
      const gridSize = 32;
      const newData: number[][] = [];
      
      // Create hotspots
      const hotspots = [
        { x: 10, y: 8, intensity: 0.9, radius: 5 },
        { x: 22, y: 15, intensity: 0.8, radius: 7 },
        { x: 5, y: 25, intensity: 0.7, radius: 4 },
        { x: 28, y: 28, intensity: 0.85, radius: 6 }
      ];
      
      for (let y = 0; y < gridSize; y++) {
        const row: number[] = [];
        for (let x = 0; x < gridSize; x++) {
          // Base low value
          let value = Math.random() * 0.1;
          
          // Add hotspot influence
          hotspots.forEach(spot => {
            const distance = Math.sqrt(Math.pow(x - spot.x, 2) + Math.pow(y - spot.y, 2));
            if (distance < spot.radius) {
              const influence = (1 - distance / spot.radius) * spot.intensity;
              value += influence;
            }
          });
          
          // Clamp value between 0 and 1
          value = Math.min(1, Math.max(0, value));
          row.push(value);
        }
        newData.push(row);
      }
      
      return newData;
    };
    
    setData(generateHeatMapData());
  }, []);
  
  // Render heat map
  useEffect(() => {
    if (!canvasRef.current || !visible || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set global alpha for transparency
    ctx.globalAlpha = opacity;
    
    const cellWidth = canvas.width / data[0].length;
    const cellHeight = canvas.height / data.length;
    
    // Draw heat map cells
    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data[y].length; x++) {
        const value = data[y][x];
        
        // Color scale: blue (cold) to red (hot)
        const r = Math.floor(255 * Math.min(1, value * 2));
        const g = Math.floor(255 * Math.min(1, 2 - value * 2));
        const b = Math.floor(255 * Math.max(0, 1 - value * 2));
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
    
    // Draw grid lines (optional)
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    
    for (let y = 0; y <= data.length; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(canvas.width, y * cellHeight);
      ctx.stroke();
    }
    
    for (let x = 0; x <= data[0].length; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, canvas.height);
      ctx.stroke();
    }
    
  }, [data, visible, opacity]);
  
  return (
    <div className={`fixed inset-0 pointer-events-none z-40 ${visible ? 'block' : 'hidden'}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        width={800}
        height={800}
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <Card className="w-64">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Interaction Heat Map</span>
              <Switch 
                checked={visible}
                onCheckedChange={onVisibilityChange}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="opacity" className="text-xs">Opacity</Label>
                  <span className="text-xs">{Math.round(opacity * 100)}%</span>
                </div>
                <Slider
                  id="opacity"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[opacity]}
                  onValueChange={(value) => setOpacity(value[0])}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HeatMapOverlay;