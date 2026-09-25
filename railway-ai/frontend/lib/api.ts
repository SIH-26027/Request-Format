/**
 * Railway Automatic Block Planning System API Client
 * Integrated with Next.js Database API and local synchronization.
 */

import { BlockRequestRecord } from '../types/request';
import { RequestService } from '../services/request.service';

export const apiClient = {
  getRequests: async (): Promise<BlockRequestRecord[]> => {
    return RequestService.fetchAll();
  },
  getRequestById: async (id: string): Promise<BlockRequestRecord | undefined> => {
    return RequestService.fetchById(id);
  },
  submitRequest: async (record: BlockRequestRecord): Promise<BlockRequestRecord> => {
    return RequestService.save(record);
  },
  clearRequests: async (): Promise<void> => {
    return RequestService.clearAll();
  }
};
