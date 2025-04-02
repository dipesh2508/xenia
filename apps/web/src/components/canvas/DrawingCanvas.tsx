import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";

interface Position {
  x: number;
  y: number;
}

interface CanvasUser {
  id: string;
  name: string;
  image: string | null;
  color: string;
  mousePosition?: Position | null;
  lastActive: Date;
}

interface DrawingCanvasProps {
  selectedTool: string;
  selectedColor: string;
  strokeWidth: number;
  onDrawingEvent: (drawingData: any) => void;
  onReady: () => void;
  activeUsers: CanvasUser[];
  disabled?: boolean;
}

const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ selectedTool, selectedColor, strokeWidth, onDrawingEvent, onReady, activeUsers, disabled = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPosition, setStartPosition] = useState<Position | null>(null);
    const [tempCanvas, setTempCanvas] = useState<HTMLCanvasElement | null>(null);
    // Add a ref for storing the original canvas state before drawing shapes
    const backupCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Forward the canvas ref to the parent component
    useImperativeHandle(ref, () => canvasRef.current!);

    // Initialize canvas and set it up
    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Setup canvas for high DPI displays
        const setupCanvas = () => {
          const dpr = window.devicePixelRatio || 1;
          const rect = canvas.getBoundingClientRect();
          
          // Set the canvas dimensions based on its displayed size
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          
          // Scale the context to ensure correct drawing
          ctx.scale(dpr, dpr);
          
          // Set canvas CSS size
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
          
          // Create temp canvas for shape drawing
          const tempCanvasElem = document.createElement("canvas");
          tempCanvasElem.width = canvas.width;
          tempCanvasElem.height = canvas.height;
          setTempCanvas(tempCanvasElem);
          
          // Signal that the canvas is ready
          onReady();
        };
        
        // Setup canvas initially and on resize
        setupCanvas();
        
        const resizeObserver = new ResizeObserver(() => {
          setupCanvas();
        });
        
        resizeObserver.observe(canvas);
        
        return () => {
          resizeObserver.disconnect();
        };
      }
    }, [onReady]);

    // Add a mousemove event on the canvas div for cursor tracking
    useEffect(() => {
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;

      // Create a function to handle mouse movement for cursor tracking
      const trackMouseMove = (e: MouseEvent) => {
        const rect = canvasElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Forward mouse position to parent component via a custom event
        const event = new CustomEvent('canvasCursorMove', { 
          detail: { x, y }
        });
        canvasElement.dispatchEvent(event);
      };

      // Add event listener
      canvasElement.addEventListener('mousemove', trackMouseMove);
      
      // Clean up
      return () => {
        canvasElement.removeEventListener('mousemove', trackMouseMove);
      };
    }, []);

    // Draw shape on temp canvas during mouse move
    const drawShapeOnTemp = (
      currentPosition: Position
    ) => {
      if (!startPosition || !tempCanvas) return;

      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Clear temp canvas
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Set drawing styles
      tempCtx.strokeStyle = selectedColor;
      tempCtx.lineWidth = strokeWidth;
      tempCtx.lineCap = "round";
      tempCtx.lineJoin = "round";

      switch (selectedTool) {
        case "line":
          tempCtx.beginPath();
          tempCtx.moveTo(startPosition.x, startPosition.y);
          tempCtx.lineTo(currentPosition.x, currentPosition.y);
          tempCtx.stroke();
          break;
        case "rectangle":
          const width = currentPosition.x - startPosition.x;
          const height = currentPosition.y - startPosition.y;
          tempCtx.strokeRect(startPosition.x, startPosition.y, width, height);
          break;
        case "circle":
          const dx = currentPosition.x - startPosition.x;
          const dy = currentPosition.y - startPosition.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          tempCtx.beginPath();
          tempCtx.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
          tempCtx.stroke();
          break;
        default:
          break;
      }

      // Get the main canvas and its context
      const mainCanvas = canvasRef.current;
      const ctx = mainCanvas?.getContext("2d");
      
      if (ctx && mainCanvas) {
        // Store the current main canvas content for redrawing
        if (!backupCanvasRef.current) {
          backupCanvasRef.current = document.createElement('canvas');
          backupCanvasRef.current.width = mainCanvas.width;
          backupCanvasRef.current.height = mainCanvas.height;
          
          // Make initial backup of main canvas
          const backupCtx = backupCanvasRef.current.getContext('2d');
          backupCtx?.drawImage(mainCanvas, 0, 0);
        }
        
        // Redraw the main canvas in this sequence:
        // 1. Clear the canvas
        ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        
        // 2. Draw the original content from backup
        ctx.drawImage(backupCanvasRef.current, 0, 0);
        
        // 3. Draw the temporary shape on top
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    // Finish the shape and send the drawing event
    const completeShape = (endPosition: Position) => {
      if (!startPosition) return;

      // Get the final drawing data for the shape type
      let drawingData: any = {
        type: selectedTool,
        color: selectedColor,
        width: strokeWidth,
      };

      switch (selectedTool) {
        case "line":
          drawingData = {
            ...drawingData,
            start: startPosition,
            end: endPosition,
          };
          break;
        case "rectangle":
          const rectWidth = endPosition.x - startPosition.x;
          const height = endPosition.y - startPosition.y;
          drawingData = {
            ...drawingData,
            startPoint: startPosition,
            width: rectWidth,
            height,
          };
          break;
        case "circle":
          const dx = endPosition.x - startPosition.x;
          const dy = endPosition.y - startPosition.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          drawingData = {
            ...drawingData,
            center: startPosition,
            radius,
          };
          break;
        default:
          return; // Invalid tool type
      }

      // Apply the final shape to the canvas using the backup and temp canvas
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      // We first restore the original canvas from the backup
      if (backupCanvasRef.current) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(backupCanvasRef.current, 0, 0);
      }
      
      // Then draw the final shape directly on the canvas
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (selectedTool) {
        case "line":
          ctx.beginPath();
          ctx.moveTo(startPosition.x, startPosition.y);
          ctx.lineTo(endPosition.x, endPosition.y);
          ctx.stroke();
          break;
        case "rectangle":
          const rectWidth = endPosition.x - startPosition.x;
          const height = endPosition.y - startPosition.y;
          ctx.strokeRect(startPosition.x, startPosition.y, rectWidth, height);
          break;
        case "circle":
          const dx = endPosition.x - startPosition.x;
          const dy = endPosition.y - startPosition.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          ctx.beginPath();
          ctx.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
      }
      
      // Send the drawing event to other users
      onDrawingEvent(drawingData);
    };

    // Handle mouse down event
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const position = { x, y };

      setStartPosition(position);

      if (selectedTool === "pencil") {
        setIsDrawing(true);
      } else if (["line", "rectangle", "circle"].includes(selectedTool)) {
        // Create backup of current canvas state before we start drawing a shape
        if (canvasRef.current) {
          backupCanvasRef.current = document.createElement('canvas');
          backupCanvasRef.current.width = canvasRef.current.width;
          backupCanvasRef.current.height = canvasRef.current.height;
          
          const backupCtx = backupCanvasRef.current.getContext('2d');
          backupCtx?.drawImage(canvasRef.current, 0, 0);
        }
        
        setIsDrawing(true);
      }
    };

    // Handle mouse move event
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const currentPosition = { x, y };

      if (isDrawing) {
        if (selectedTool === "pencil" && startPosition) {
          // For pencil, draw a line segment directly on the canvas
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.beginPath();
            ctx.moveTo(startPosition.x, startPosition.y);
            ctx.lineTo(currentPosition.x, currentPosition.y);
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();
          }
          
          // Broadcast the drawing event
          onDrawingEvent({
            type: "pencil",
            from: startPosition,
            to: currentPosition,
            color: selectedColor,
            width: strokeWidth,
          });
          
          setStartPosition(currentPosition);
        } else if (["line", "rectangle", "circle"].includes(selectedTool)) {
          // For shapes, draw on temporary canvas
          drawShapeOnTemp(currentPosition);
        }
      }
    };

    // Handle mouse up event
    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled || !isDrawing) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const currentPosition = { x, y };

      if (["line", "rectangle", "circle"].includes(selectedTool)) {
        completeShape(currentPosition);
        // Clear the backup canvas reference after completing the shape
        backupCanvasRef.current = null;
      }

      setIsDrawing(false);
      setStartPosition(null);
    };

    // Handle mouse leave event
    const handleMouseLeave = () => {
      if (isDrawing && ["line", "rectangle", "circle"].includes(selectedTool)) {
        // If user leaves the canvas while drawing a shape, restore original canvas
        if (backupCanvasRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx?.drawImage(backupCanvasRef.current, 0, 0);
          backupCanvasRef.current = null;
        }
        
        setIsDrawing(false);
        setStartPosition(null);
      }
    };

    return (
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full h-full ${disabled ? "cursor-not-allowed" : "cursor-crosshair"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Render cursor positions for other users */}
        {activeUsers.map((user) => 
          user.mousePosition && (
            <motion.div
              key={user.id}
              className="absolute pointer-events-none"
              style={{
                left: user.mousePosition.x,
                top: user.mousePosition.y,
                zIndex: 20,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="flex flex-col items-center"
                style={{ transform: "translate(-50%, -100%)" }}
              >
                <div 
                  className="w-4 h-4 rounded-full mb-1"
                  style={{ backgroundColor: user.color }}
                />
                <div className="bg-background text-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                  {user.name}
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>
    );
  }
);

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas; 