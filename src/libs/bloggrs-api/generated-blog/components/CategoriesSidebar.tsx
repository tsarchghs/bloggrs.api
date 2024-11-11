import React from 'react';
import PropTypes from 'prop-types';

interface CategoriesSidebarProps {
  categories: any[];
}

export function CategoriesSidebar({ categories }: CategoriesSidebarProps) {
  return (
    <div className="categories-sidebar">
      <h3>Categories</h3>
      <ul>
        {categories.map(category => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}

CategoriesSidebar.propTypes = {
  categories: PropTypes.array.isRequired
};