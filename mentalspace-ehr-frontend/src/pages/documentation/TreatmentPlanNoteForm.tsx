import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TreatmentPlanNoteForm } from '../../models/documentation/TreatmentPlanNoteForm';
import { NoteStatus } from '../../models/documentation/Note';

// Component for the multi-step wizard form
const TreatmentPlanNoteFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // State for form data
  const [formData, setFormData] = useState<TreatmentPlanNoteForm>({
    basicInfo: {
      clientName: '',
      planCreationDate: '',
      currentDiagnosis: '',
    },
    goals: [],
    objectives: [],
    interventions: [],
    signOff: {
      clientReviewed: false,
      clinicianSignature: '',
    },
  });
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for showing confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Function to handle form field changes
  const handleChange = (section: keyof TreatmentPlanNoteForm, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error for this field if it exists
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };
  
  // Function to handle array field changes
  const handleArrayChange = (section: 'goals' | 'objectives' | 'interventions', index: number, field: string, value: any) => {
    setFormData(prev => {
      const newArray = [...prev[section]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
      return {
        ...prev,
        [section]: newArray
      };
    });
    
    // Clear error for this field if it exists
    if (errors[`${section}[${index}].${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}[${index}].${field}`];
        return newErrors;
      });
    }
  };
  
  // Function to add a new goal
  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, { description: '' }]
    }));
  };
  
  // Function to remove a goal
  const removeGoal = (index: number) => {
    setFormData(prev => {
      const newGoals = [...prev.goals];
      newGoals.splice(index, 1);
      
      // Also remove objectives associated with this goal
      const newObjectives = prev.objectives.filter(obj => obj.goalIndex !== index);
      
      // Update goalIndex for objectives after the removed goal
      const updatedObjectives = newObjectives.map(obj => {
        if (obj.goalIndex > index) {
          return { ...obj, goalIndex: obj.goalIndex - 1 };
        }
        return obj;
      });
      
      return {
        ...prev,
        goals: newGoals,
        objectives: updatedObjectives
      };
    });
  };
  
  // Function to add a new objective
  const addObjective = (goalIndex: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, { 
        goalIndex, 
        description: '',
        targetDate: '',
        metrics: ''
      }]
    }));
  };
  
  // Function to remove an objective
  const removeObjective = (index: number) => {
    setFormData(prev => {
      const newObjectives = [...prev.objectives];
      const removedObjective = newObjectives[index];
      newObjectives.splice(index, 1);
      
      // Also remove interventions associated with this objective
      const newInterventions = prev.interventions.filter(int => int.objectiveIndex !== index);
      
      // Update objectiveIndex for interventions after the removed objective
      const updatedInterventions = newInterventions.map(int => {
        if (int.objectiveIndex > index) {
          return { ...int, objectiveIndex: int.objectiveIndex - 1 };
        }
        return int;
      });
      
      return {
        ...prev,
        objectives: newObjectives,
        interventions: updatedInterventions
      };
    });
  };
  
  // Function to add a new intervention
  const addIntervention = (objectiveIndex: number) => {
    setFormData(prev => ({
      ...prev,
      interventions: [...prev.interventions, { 
        objectiveIndex, 
        description: '',
        frequency: 'Weekly'
      }]
    }));
  };
  
  // Function to remove an intervention
  const removeIntervention = (index: number) => {
    setFormData(prev => {
      const newInterventions = [...prev.interventions];
      newInterventions.splice(index, 1);
      return {
        ...prev,
        interventions: newInterventions
      };
    });
  };
  
  // Function to validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Basic Client & Diagnosis Information
        if (!formData.basicInfo.clientName) {
          newErrors['basicInfo.clientName'] = 'Client name is required';
        }
        if (!formData.basicInfo.planCreationDate) {
          newErrors['basicInfo.planCreationDate'] = 'Plan creation date is required';
        }
        if (!formData.basicInfo.currentDiagnosis) {
          newErrors['basicInfo.currentDiagnosis'] = 'Current diagnosis is required';
        }
        if (formData.basicInfo.currentDiagnosis === 'Other' && !formData.basicInfo.otherDiagnosis) {
          newErrors['basicInfo.otherDiagnosis'] = 'Please specify the diagnosis';
        }
        break;
        
      case 2: // Goals
        if (formData.goals.length === 0) {
          newErrors['goals'] = 'At least one goal is required';
        } else {
          formData.goals.forEach((goal, index) => {
            if (!goal.description) {
              newErrors[`goals[${index}].description`] = `Goal ${index + 1} description is required`;
            }
          });
        }
        break;
        
      case 3: // Objectives for Each Goal
        if (formData.objectives.length === 0) {
          newErrors['objectives'] = 'At least one objective is required';
        } else {
          formData.objectives.forEach((objective, index) => {
            if (!objective.description) {
              newErrors[`objectives[${index}].description`] = `Objective ${index + 1} description is required`;
            }
            if (!objective.targetDate) {
              newErrors[`objectives[${index}].targetDate`] = `Objective ${index + 1} target date is required`;
            }
            if (!objective.metrics) {
              newErrors[`objectives[${index}].metrics`] = `Objective ${index + 1} metrics are required`;
            }
          });
        }
        break;
        
      case 4: // Interventions
        if (formData.interventions.length === 0) {
          newErrors['interventions'] = 'At least one intervention is required';
        } else {
          formData.interventions.forEach((intervention, index) => {
            if (!intervention.description) {
              newErrors[`interventions[${index}].description`] = `Intervention ${index + 1} description is required`;
            }
          });
        }
        break;
        
      case 5: // Sign-Off & Client Involvement
        if (!formData.signOff.clinicianSignature) {
          newErrors['signOff.clinicianSignature'] = 'Clinician signature is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Function to handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        // If on the last step, show confirmation modal
        setShowConfirmModal(true);
      }
    }
  };
  
  // Function to handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Function to save draft
  const handleSaveDraft = async () => {
    try {
      // Mock API call - would be replaced with actual API call
      console.log('Saving draft:', formData);
      alert('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft');
    }
  };
  
  // Function to finalize and sign the note
  const handleFinalizeNote = async () => {
    try {
      // Mock API call - would be replaced with actual API call
      console.log('Finalizing note:', formData);
      alert('Note finalized and signed successfully');
      navigate('/documentation');
    } catch (error) {
      console.error('Error finalizing note:', error);
      alert('Error finalizing note');
    }
  };
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderGoalsStep();
      case 3:
        return renderObjectivesStep();
      case 4:
        return renderInterventionsStep();
      case 5:
        return renderSignOffStep();
      default:
        return null;
    }
  };
  
  // Step 1: Basic Client & Diagnosis Information
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Basic Client & Diagnosis Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['basicInfo.clientName'] ? 'border-red-500' : ''
            }`}
            value={formData.basicInfo.clientName}
            onChange={(e) => handleChange('basicInfo', 'clientName', e.target.value)}
          />
          {errors['basicInfo.clientName'] && (
            <p className="mt-1 text-sm text-red-500">{errors['basicInfo.clientName']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Plan Creation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['basicInfo.planCreationDate'] ? 'border-red-500' : ''
            }`}
            value={formData.basicInfo.planCreationDate}
            onChange={(e) => handleChange('basicInfo', 'planCreationDate', e.target.value)}
          />
          {errors['basicInfo.planCreationDate'] && (
            <p className="mt-1 text-sm text-red-500">{errors['basicInfo.planCreationDate']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Diagnosis <span className="text-red-500">*</span>
          </label>
          <select
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['basicInfo.currentDiagnosis'] ? 'border-red-500' : ''
            }`}
            value={formData.basicInfo.currentDiagnosis}
            onChange={(e) => handleChange('basicInfo', 'currentDiagnosis', e.target.value)}
          >
            <option value="">Select a diagnosis</option>
            <option value="F32.1">F32.1 - Major Depressive Disorder, Moderate</option>
            <option value="F41.1">F41.1 - Generalized Anxiety Disorder</option>
            <option value="F43.10">F43.10 - Post-Traumatic Stress Disorder</option>
            <option value="F60.3">F60.3 - Borderline Personality Disorder</option>
            <option value="F90.0">F90.0 - Attention-Deficit Hyperactivity Disorder</option>
            <option value="F42">F42 - Obsessive-Compulsive Disorder</option>
            <option value="F31.9">F31.9 - Bipolar Disorder, Unspecified</option>
            <option value="F20.9">F20.9 - Schizophrenia</option>
            <option value="F50.0">F50.0 - Anorexia Nervosa</option>
            <option value="F50.2">F50.2 - Bulimia Nervosa</option>
            <option value="Other">Other</option>
          </select>
          {errors['basicInfo.currentDiagnosis'] && (
            <p className="mt-1 text-sm text-red-500">{errors['basicInfo.currentDiagnosis']}</p>
          )}
        </div>
        
        {formData.basicInfo.currentDiagnosis === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Other Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['basicInfo.otherDiagnosis'] ? 'border-red-500' : ''
              }`}
              value={formData.basicInfo.otherDiagnosis || ''}
              onChange={(e) => handleChange('basicInfo', 'otherDiagnosis', e.target.value)}
              placeholder="Enter diagnosis code and description"
            />
            {errors['basicInfo.otherDiagnosis'] && (
              <p className="mt-1 text-sm text-red-500">{errors['basicInfo.otherDiagnosis']}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Step 2: Goals
  const renderGoalsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Treatment Goals</h2>
      
      {errors['goals'] && (
        <p className="mt-1 text-sm text-red-500">{errors['goals']}</p>
      )}
      
      <div className="space-y-6">
        {formData.goals.map((goal, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Goal {index + 1}</h3>
              <button
                type="button"
                className="text-red-600 hover:text-red-800"
                onClick={() => removeGoal(index)}
              >
                Remove
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors[`goals[${index}].description`] ? 'border-red-500' : ''
                }`}
                value={goal.description}
                onChange={(e) => handleArrayChange('goals', index, 'description', e.target.value)}
                placeholder="Enter a specific, measurable goal"
              />
              {errors[`goals[${index}].description`] && (
                <p className="mt-1 text-sm text-red-500">{errors[`goals[${index}].description`]}</p>
              )}
            </div>
          </div>
        ))}
        
        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={addGoal}
        >
          Add Goal
        </button>
      </div>
    </div>
  );
  
  // Step 3: Objectives for Each Goal
  const renderObjectivesStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Objectives for Each Goal</h2>
      
      {errors['objectives'] && (
        <p className="mt-1 text-sm text-red-500">{errors['objectives']}</p>
      )}
      
      <div className="space-y-8">
        {formData.goals.map((goal, goalIndex) => (
          <div key={goalIndex} className="p-4 border border-gray-300 rounded-md">
            <h3 className="text-lg font-medium mb-2">Goal {goalIndex + 1}: {goal.description}</h3>
            
            <div className="space-y-4 mt-4">
              {formData.objectives
                .filter(obj => obj.goalIndex === goalIndex)
                .map((objective, objLocalIndex) => {
                  // Find the actual index in the overall objectives array
                  const objGlobalIndex = formData.objectives.findIndex(
                    o => o.goalIndex === goalIndex && o.description === objective.description
                  );
                  
                  return (
                    <div key={objGlobalIndex} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-medium">Objective {objLocalIndex + 1}</h4>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => removeObjective(objGlobalIndex)}
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                              errors[`objectives[${objGlobalIndex}].description`] ? 'border-red-500' : ''
                            }`}
                            value={objective.description}
                            onChange={(e) => handleArrayChange('objectives', objGlobalIndex, 'description', e.target.value)}
                            placeholder="Enter a specific, measurable objective"
                          />
                          {errors[`objectives[${objGlobalIndex}].description`] && (
                            <p className="mt-1 text-sm text-red-500">{errors[`objectives[${objGlobalIndex}].description`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Target Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                              errors[`objectives[${objGlobalIndex}].targetDate`] ? 'border-red-500' : ''
                            }`}
                            value={objective.targetDate}
                            onChange={(e) => handleArrayChange('objectives', objGlobalIndex, 'targetDate', e.target.value)}
                          />
                          {errors[`objectives[${objGlobalIndex}].targetDate`] && (
                            <p className="mt-1 text-sm text-red-500">{errors[`objectives[${objGlobalIndex}].targetDate`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Metrics <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                              errors[`objectives[${objGlobalIndex}].metrics`] ? 'border-red-500' : ''
                            }`}
                            value={objective.metrics}
                            onChange={(e) => handleArrayChange('objectives', objGlobalIndex, 'metrics', e.target.value)}
                            placeholder="How will progress be measured?"
                          />
                          {errors[`objectives[${objGlobalIndex}].metrics`] && (
                            <p className="mt-1 text-sm text-red-500">{errors[`objectives[${objGlobalIndex}].metrics`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              <button
                type="button"
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                onClick={() => addObjective(goalIndex)}
              >
                Add Objective for Goal {goalIndex + 1}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Step 4: Interventions
  const renderInterventionsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Interventions</h2>
      
      {errors['interventions'] && (
        <p className="mt-1 text-sm text-red-500">{errors['interventions']}</p>
      )}
      
      <div className="space-y-8">
        {formData.objectives.map((objective, objIndex) => {
          const goalIndex = objective.goalIndex;
          const goal = formData.goals[goalIndex];
          
          return (
            <div key={objIndex} className="p-4 border border-gray-300 rounded-md">
              <h3 className="text-lg font-medium mb-1">Goal {goalIndex + 1}: {goal.description}</h3>
              <h4 className="text-md font-medium mb-3">Objective: {objective.description}</h4>
              
              <div className="space-y-4 mt-4">
                {formData.interventions
                  .filter(int => int.objectiveIndex === objIndex)
                  .map((intervention, intLocalIndex) => {
                    // Find the actual index in the overall interventions array
                    const intGlobalIndex = formData.interventions.findIndex(
                      i => i.objectiveIndex === objIndex && i.description === intervention.description
                    );
                    
                    return (
                      <div key={intGlobalIndex} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">Intervention {intLocalIndex + 1}</h5>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => removeIntervention(intGlobalIndex)}
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              rows={2}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                errors[`interventions[${intGlobalIndex}].description`] ? 'border-red-500' : ''
                              }`}
                              value={intervention.description}
                              onChange={(e) => handleArrayChange('interventions', intGlobalIndex, 'description', e.target.value)}
                              placeholder="Describe the therapeutic intervention"
                            />
                            {errors[`interventions[${intGlobalIndex}].description`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`interventions[${intGlobalIndex}].description`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Frequency <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={intervention.frequency}
                              onChange={(e) => handleArrayChange('interventions', intGlobalIndex, 'frequency', e.target.value)}
                            >
                              <option value="Weekly">Weekly</option>
                              <option value="Bi-Weekly">Bi-Weekly</option>
                              <option value="Monthly">Monthly</option>
                              <option value="As Needed">As Needed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  onClick={() => addIntervention(objIndex)}
                >
                  Add Intervention for this Objective
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  // Step 5: Sign-Off & Client Involvement
  const renderSignOffStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sign-Off & Client Involvement</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Review
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.signOff.clientReviewed}
              onChange={(e) => handleChange('signOff', 'clientReviewed', e.target.checked)}
            />
            <span className="ml-2 text-gray-700">Client has reviewed and agrees with this treatment plan</span>
          </div>
        </div>
        
        {formData.signOff.clientReviewed && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Signature
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.signOff.clientSignature || ''}
              onChange={(e) => handleChange('signOff', 'clientSignature', e.target.value)}
              placeholder="Client's full name as signature"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Clinician Signature <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['signOff.clinicianSignature'] ? 'border-red-500' : ''
            }`}
            value={formData.signOff.clinicianSignature}
            onChange={(e) => handleChange('signOff', 'clinicianSignature', e.target.value)}
            placeholder="Your full name as signature"
          />
          {errors['signOff.clinicianSignature'] && (
            <p className="mt-1 text-sm text-red-500">{errors['signOff.clinicianSignature']}</p>
          )}
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            By signing this treatment plan, you confirm that all information is accurate and that the plan meets clinical standards and client needs.
          </p>
        </div>
      </div>
    </div>
  );
  
  // Confirmation Modal
  const renderConfirmationModal = () => (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 ${showConfirmModal ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Treatment Plan Finalization</h3>
        <p className="text-gray-500 mb-6">
          All sections of the Treatment Plan are complete. Once signed, the plan will be locked and can only be modified through a formal update process. Are you ready to finalize this plan?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleFinalizeNote}
          >
            Confirm and Sign
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Treatment Plan</h1>
        <p className="text-gray-600">
          {isEditMode ? 'Edit existing treatment plan' : 'Create a new treatment plan'}
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`flex items-center ${index > 0 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index + 1 === currentStep
                    ? 'bg-blue-600 text-white'
                    : index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1 < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-xs">Basic Info</div>
          <div className="text-xs">Goals</div>
          <div className="text-xs">Objectives</div>
          <div className="text-xs">Interventions</div>
          <div className="text-xs">Sign-Off</div>
        </div>
      </div>
      
      {/* Form content */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {renderStepContent()}
      </div>
      
      {/* Form navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={handlePrevStep}
            >
              Previous
            </button>
          )}
        </div>
        <div>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-4"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleNextStep}
          >
            {currentStep < totalSteps ? 'Next' : 'Finalize and Sign'}
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {renderConfirmationModal()}
    </div>
  );
};

export default TreatmentPlanNoteFormComponent;
