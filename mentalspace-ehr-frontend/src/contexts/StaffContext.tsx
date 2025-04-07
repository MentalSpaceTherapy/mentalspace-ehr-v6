import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { staffAPI } from '../services/api';
import { Staff } from '../models/Staff';
import { SupervisionRelationship } from '../models/SupervisionRelationship';
import { Role } from '../models/Role';
import { CompensationRule } from '../models/CompensationRule';
import { useAuth } from './AuthContext';

interface StaffContextType {
  staff: Staff[];
  selectedStaff: Staff | null;
  supervisionRelationships: SupervisionRelationship[];
  loading: boolean;
  error: string | null;
  fetchStaff: (query?: any) => Promise<void>;
  fetchStaffById: (id: string) => Promise<void>;
  createStaff: (staffData: any) => Promise<Staff>;
  updateStaff: (id: string, staffData: any) => Promise<Staff>;
  deleteStaff: (id: string) => Promise<void>;
  fetchSupervisionRelationships: (query?: any) => Promise<void>;
  createSupervisionRelationship: (relationshipData: any) => Promise<SupervisionRelationship>;
  updateSupervisionRelationship: (id: string, relationshipData: any) => Promise<SupervisionRelationship>;
  deleteSupervisionRelationship: (id: string) => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [supervisionRelationships, setSupervisionRelationships] = useState<SupervisionRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStaff();
      fetchSupervisionRelationships();
    }
  }, [isAuthenticated]);

  const fetchStaff = async (query = {}) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.getStaff(query);
      setStaff(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch staff. Please try again.';
      setError(errorMessage);
      console.error('Staff fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffById = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.getStaffById(id);
      setSelectedStaff(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch staff details. Please try again.';
      setError(errorMessage);
      console.error('Staff fetch error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (staffData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.createStaff(staffData);
      const newStaff = response.data.data;
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create staff. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateStaff = async (id: string, staffData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.updateStaff(id, staffData);
      const updatedStaff = response.data.data;
      
      setStaff(prev => 
        prev.map(s => s.id === id ? updatedStaff : s)
      );
      
      if (selectedStaff && selectedStaff.id === id) {
        setSelectedStaff(updatedStaff);
      }
      
      return updatedStaff;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update staff. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await staffAPI.deleteStaff(id);
      setStaff(prev => prev.filter(s => s.id !== id));
      
      if (selectedStaff && selectedStaff.id === id) {
        setSelectedStaff(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete staff. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisionRelationships = async (query = {}) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.getSupervisionRelationships(query);
      setSupervisionRelationships(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch supervision relationships. Please try again.';
      setError(errorMessage);
      console.error('Supervision relationships fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSupervisionRelationship = async (relationshipData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.createSupervisionRelationship(relationshipData);
      const newRelationship = response.data.data;
      setSupervisionRelationships(prev => [...prev, newRelationship]);
      return newRelationship;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create supervision relationship. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSupervisionRelationship = async (id: string, relationshipData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.updateSupervisionRelationship(id, relationshipData);
      const updatedRelationship = response.data.data;
      
      setSupervisionRelationships(prev => 
        prev.map(rel => rel.id === id ? updatedRelationship : rel)
      );
      
      return updatedRelationship;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update supervision relationship. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSupervisionRelationship = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await staffAPI.deleteSupervisionRelationship(id);
      setSupervisionRelationships(prev => prev.filter(rel => rel.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete supervision relationship. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    staff,
    selectedStaff,
    supervisionRelationships,
    loading,
    error,
    fetchStaff,
    fetchStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    fetchSupervisionRelationships,
    createSupervisionRelationship,
    updateSupervisionRelationship,
    deleteSupervisionRelationship
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  
  return context;
};
