import React from "react";
import {
  Pencil,
  MousePointer,
  Square,
  Circle,
  Minus,
  Trash2,
  Type,
  Download,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/components/ui/tooltip";
import { Button } from "@repo/ui/components/ui/button";
import { Slider } from "@repo/ui/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";

// Define common colors for the color picker
const COLORS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#A52A2A", // Brown
  "#808080", // Gray
];

interface CanvasToolbarProps {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  canClear: boolean;
  onClear: () => void;
  onDownload?: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  selectedTool,
  onSelectTool,
  selectedColor,
  onSelectColor,
  strokeWidth,
  onStrokeWidthChange,
  canClear,
  onClear,
  onDownload,
}) => {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-muted/20">
      <div className="flex items-center space-x-2">
        {/* Drawing tools */}
        <TooltipProvider>
          <ToggleGroup type="single" value={selectedTool} onValueChange={(value) => value && onSelectTool(value)}>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="select" aria-label="Select tool">
                  <MousePointer className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Select</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="pencil" aria-label="Pencil tool">
                  <Pencil className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Free Draw</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="line" aria-label="Line tool">
                  <Minus className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Line</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="rectangle" aria-label="Rectangle tool">
                  <Square className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Rectangle</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="circle" aria-label="Circle tool">
                  <Circle className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Circle</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="text" aria-label="Text tool">
                  <Type className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Text</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </TooltipProvider>

        {/* Color picker */}
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-8 h-8 p-0 rounded-full border-2" 
                    style={{ backgroundColor: selectedColor }}
                  >
                    <span className="sr-only">Pick a color</span>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Select Color</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-6 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border ${
                    selectedColor === color ? "ring-2 ring-offset-2 ring-black" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onSelectColor(color)}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <label htmlFor="custom-color" className="text-xs font-medium">Custom:</label>
              <input
                id="custom-color"
                type="color"
                value={selectedColor}
                onChange={(e) => onSelectColor(e.target.value)}
                className="w-8 h-8"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Stroke width slider */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs font-medium min-w-8">Width:</span>
          <Slider
            className="w-24"
            value={[strokeWidth]}
            min={1}
            max={20}
            step={1}
            onValueChange={(value: number[]) => {
              if (value && value.length > 0 && typeof value[0] === 'number') {
                onStrokeWidthChange(value[0]);
              }
            }}
          />
          <span className="text-xs min-w-6">{strokeWidth}px</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Download canvas button */}
        {onDownload && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDownload}
                  disabled={!canClear}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Canvas</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download Canvas</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Clear canvas button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!canClear}
                onClick={onClear}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear canvas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CanvasToolbar; 