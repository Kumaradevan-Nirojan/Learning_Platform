// frontend/src/pages/EditEducator.js
import React from 'react';
import { useParams } from 'react-router-dom';
import EditEducator from '../components/EditEducator';

const EditEducatorPage = () => {
  const { id } = useParams();

  return (
    <div className="container mt-4">
      <EditEducator educatorId={id} />
    </div>
  );
};

export default EditEducatorPage;
