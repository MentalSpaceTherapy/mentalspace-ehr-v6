import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentation } from '../../contexts/DocumentationContext';
import { NoteType, NoteStatus } from '../../models/documentation/Note';

interface DocumentationIndexProps {}

const DocumentationIndex: React.FC<DocumentationIndexProps> = () => {
  const navigate = useNavigate();
  const { notes, fetchNotes, loading, error } = useDocumentation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('createNoteDropdown');
      if (dropdown && !dropdown.contains(event.target as Node) && 
          !document.getElementById('createNoteButton')?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchNotes]);

  const handleCreateNewNote = (noteType: NoteType) => {
    setDropdownOpen(false);
    
    // Navigate to the correct route based on note type
    switch (noteType) {
      case NoteType.INTAKE:
        navigate('/app/documentation/intake-note/new');
        break;
      case NoteType.PROGRESS:
        navigate('/app/documentation/progress-note/new');
        break;
      case NoteType.TREATMENT_PLAN:
        navigate('/app/documentation/treatment-plan/new');
        break;
      case NoteType.DISCHARGE:
        navigate('/app/documentation/discharge-note/new');
        break;
      case NoteType.CANCELLATION:
        navigate('/app/documentation/cancellation-note/new');
        break;
      case NoteType.CONTACT:
        navigate('/app/documentation/contact-note/new');
        break;
      default:
        navigate('/app/documentation');
    }
  };

  const handleViewNote = (noteId: string, noteType: NoteType) => {
    // Navigate to the correct route based on note type
    switch (noteType) {
      case NoteType.INTAKE:
        navigate(`/app/documentation/intake-note/${noteId}`);
        break;
      case NoteType.PROGRESS:
        navigate(`/app/documentation/progress-note/${noteId}`);
        break;
      case NoteType.TREATMENT_PLAN:
        navigate(`/app/documentation/treatment-plan/${noteId}`);
        break;
      case NoteType.DISCHARGE:
        navigate(`/app/documentation/discharge-note/${noteId}`);
        break;
      case NoteType.CANCELLATION:
        navigate(`/app/documentation/cancellation-note/${noteId}`);
        break;
      case NoteType.CONTACT:
        navigate(`/app/documentation/contact-note/${noteId}`);
        break;
      default:
        navigate('/app/documentation');
    }
  };

  // Use notes from context, or fallback to mock data if not available yet
  const displayNotes = notes.length > 0 ? notes : [
    {
      id: '1',
      clientId: '101',
      providerId: '201',
      noteType: NoteType.INTAKE,
      content: '',
      structuredContent: {},
      status: NoteStatus.DRAFT,
      createdAt: new Date('2025-04-01'),
      updatedAt: new Date('2025-04-01')
    },
    {
      id: '2',
      clientId: '102',
      providerId: '201',
      noteType: NoteType.PROGRESS,
      content: '',
      structuredContent: {},
      status: NoteStatus.SIGNED,
      signedBy: '201',
      signedAt: new Date('2025-04-02'),
      createdAt: new Date('2025-04-02'),
      updatedAt: new Date('2025-04-02')
    },
    {
      id: '3',
      clientId: '103',
      providerId: '202',
      noteType: NoteType.TREATMENT_PLAN,
      content: '',
      structuredContent: {},
      status: NoteStatus.COMPLETED,
      createdAt: new Date('2025-04-03'),
      updatedAt: new Date('2025-04-03')
    }
  ];

  const filteredNotes = displayNotes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      note.status.toLowerCase() === filterStatus.toLowerCase();
    
    const matchesType = filterType === 'all' || 
      note.noteType.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documentation</h1>
        <div className="relative">
          <button
            id="createNoteButton"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Create New Note
          </button>
          <div 
            id="createNoteDropdown" 
            className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${dropdownOpen ? '' : 'hidden'} z-10`}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => handleCreateNewNote(NoteType.INTAKE)}
              >
                Intake Note
              </button>
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => handleCreateNewNote(NoteType.PROGRESS)}
              >
                Progress Note
              </button>
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => handleCreateNewNote(NoteType.TREATMENT_PLAN)}
              >
                Treatment Plan
              </button>
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => handleCreateNewNote(NoteType.DISCHARGE)}
              >
                Discharge Note
              </button>
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => handleCreateNewNote(NoteType.CANCELLATION)}
              >
                Cancellation Note
              </button>
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => handleCreateNewNote(NoteType.CONTACT)}
              >
                Contact/Consultation Note
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="signed">Signed</option>
            <option value="locked">Locked</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="intake">Intake</option>
            <option value="progress">Progress</option>
            <option value="treatment_plan">Treatment Plan</option>
            <option value="discharge">Discharge</option>
            <option value="cancellation">Cancellation</option>
            <option value="contact">Contact/Consultation</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <tr key={note.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {note.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {note.clientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {note.noteType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${note.status === NoteStatus.DRAFT ? 'bg-yellow-100 text-yellow-800' : 
                          note.status === NoteStatus.COMPLETED ? 'bg-blue-100 text-blue-800' : 
                          note.status === NoteStatus.SIGNED ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {note.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleViewNote(note.id, note.noteType)}
                      >
                        View
                      </button>
                      {note.status !== NoteStatus.LOCKED && (
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleViewNote(note.id, note.noteType)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No notes found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentationIndex;
