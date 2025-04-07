import React from 'react';

export interface FileUpload {
  id?: string;
  entityType: string;
  entityId: string;
  fileType: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default FileUpload;
