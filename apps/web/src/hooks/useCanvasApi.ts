import { useApi } from "@/hooks/useApi";

interface Canvas {
  id: string;
  snapshot: string | null;
  communityId: string;
  createdAt: string;
  updatedAt: string;
}

export const useCanvasApi = () => {
  const { 
    data: canvasData, 
    mutate: getOrCreateCanvas, 
    isLoading: isLoadingCanvas 
  } = useApi<Canvas>('/canvas/:id', {
    method: 'GET',
    enabled: false,
  });

  const { 
    mutate: updateSnapshot, 
    isLoading: isUpdatingSnapshot 
  } = useApi<Canvas>('/canvas/:id/snapshot', {
    method: 'PUT',
    enabled: false,
  });

  const { 
    data: communityCanvases, 
    mutate: getCommunityCanvases, 
    isLoading: isLoadingCommunityCanvases 
  } = useApi<Canvas[]>('/canvas/community/:communityId', {
    method: 'GET',
    enabled: false,
  });

  const getOrCreateCommunityCanvas = async (communityId: string) => {
    return getOrCreateCanvas({
      url: `/canvas/community:${communityId}`,
    });
  };

  const updateCanvasSnapshot = async (canvasId: string, snapshot: string) => {
    return updateSnapshot({
      url: `/canvas/${canvasId}/snapshot`,
      body: { snapshot },
    });
  };

  const getCanvasesForCommunity = async (communityId: string) => {
    return getCommunityCanvases({
      url: `/canvas/community/${communityId}`,
    });
  };

  return {
    canvas: canvasData,
    canvases: communityCanvases,
    isLoadingCanvas,
    isUpdatingSnapshot,
    isLoadingCommunityCanvases,
    getOrCreateCommunityCanvas,
    updateCanvasSnapshot,
    getCanvasesForCommunity,
  };
}; 