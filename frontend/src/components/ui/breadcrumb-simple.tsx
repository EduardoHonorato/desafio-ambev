import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  homeLink: string;
  parentLink?: string;
  parentLabel?: string;
  currentLabel: string;
}

export const SimpleBreadcrumb = ({ homeLink, parentLink, parentLabel, currentLabel }: BreadcrumbProps) => {
  return (
    <div className="text-sm text-gray-600">
      <Link to={homeLink} className="text-gray-400 hover:text-gray-600 cursor-pointer">
        Home
      </Link>
      {parentLink && parentLabel && (
        <>
          <span className="mx-1">/</span>
          <Link to={parentLink} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            {parentLabel}
          </Link>
        </>
      )}
      <span className="mx-1">/</span>
      <span className="text-gray-900">{currentLabel}</span>
    </div>
  );
};