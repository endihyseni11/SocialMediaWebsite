import React, { useState, useEffect } from 'react';

const Director = () => {
  const [directors, setDirectors] = useState([]);
  const [editingDirector, setEditingDirector] = useState(null);
  const [newDirector, setNewDirector] = useState({
    name: '',
    birthYear: '',
  });

  const fetchDirectors = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Directors');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDirectors(data);
    } catch (error) {
      console.error('Error fetching directors:', error);
    }
  };

  useEffect(() => {
    fetchDirectors();
  }, []);

  const handleEdit = (director) => {
    setEditingDirector({ ...director });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://localhost:7069/api/Directors/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      fetchDirectors();
    } catch (error) {
      console.error('Error deleting director:', error);
    }
  };

  const handleFormSubmit = async () => {
    try {
      const response = await fetch(`https://localhost:7069/api/Directors/${editingDirector.directorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingDirector),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setEditingDirector(null);
      fetchDirectors();
    } catch (error) {
      console.error('Error saving director:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditingDirector({
      ...editingDirector,
      [name]: value,
    });
  };

  const handleCreateDirector = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Directors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDirector),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Clear the input fields
      setNewDirector({
        name: '',
        birthYear: '',
      });
      fetchDirectors();
    } catch (error) {
      console.error('Error creating director:', error);
    }
  };

  return (
    <div>
      <h1>Director List</h1>
      <ul>
        {directors.map((director) => (
          <li key={director.directorId}>
            {editingDirector && editingDirector.directorId === director.directorId ? (
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={editingDirector.name}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="birthYear"
                  placeholder="Birth Year"
                  value={editingDirector.birthYear}
                  onChange={handleInputChange}
                />
                <button onClick={handleFormSubmit}>Save</button>
              </div>
            ) : (
              <>
                {director.name} ({director.birthYear})
                <button onClick={() => handleEdit(director)}>Edit</button>
                <button onClick={() => handleDelete(director.directorId)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <h2>Create Director</h2>
      <h2>Create Director</h2>
<div>
  <input
    type="text"
    name="name"
    placeholder="Name"
    value={newDirector.name}
    onChange={(e) => setNewDirector({ ...newDirector, name: e.target.value })}
  />
  <input
    type="number"
    name="birthYear"
    placeholder="Birth Year"
    value={newDirector.birthYear}
    onChange={(e) => setNewDirector({ ...newDirector, birthYear: e.target.value })}
  />
  <button onClick={handleCreateDirector}>Create</button>
</div>
    </div>
  );
};

export default Director;
