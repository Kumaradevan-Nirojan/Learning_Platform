import React from 'react';

const DashboardTitle = ({ title, subtitle, icon }) => {
  return (
    <div className="my-4 px-3">
      {title && (
        <div className="d-flex align-items-center">
          {icon && <span className="me-2">{icon}</span>}
          <h2 className="fw-bold text-primary mb-0">{title}</h2>
        </div>
      )}
      {subtitle && <p className="text-muted mb-1">{subtitle}</p>}
    </div>
  );
};

export default DashboardTitle;
