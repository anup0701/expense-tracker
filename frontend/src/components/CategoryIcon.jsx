import React from 'react';
import * as LuIcons from 'react-icons/lu';

const CategoryIcon = ({ iconName, className = '', color = 'currentColor', size = 24 }) => {
  // If no icon name is provided, use a default package icon
  if (!iconName) {
    return <LuIcons.LuPackage className={className} size={size} color={color} />;
  }

  // Get the icon component from Lucide icons
  const IconComponent = LuIcons[iconName];

  // If the icon exists in Lucide, render it
  if (IconComponent) {
    return <IconComponent className={className} size={size} color={color} />;
  }

  // Fallback: If it was an old emoji (not recommended, but for compatibility)
  // we just render it as text
  if (iconName.length <= 4) {
    return <span className={className} style={{ fontSize: `${size}px` }}>{iconName}</span>;
  }

  // Final fallback
  return <LuIcons.LuPackage className={className} size={size} color={color} />;
};

export default CategoryIcon;
