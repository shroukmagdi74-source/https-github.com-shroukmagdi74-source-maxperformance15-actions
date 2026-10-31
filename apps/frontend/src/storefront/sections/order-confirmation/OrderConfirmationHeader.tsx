import React from 'react';

interface OrderConfirmationHeaderProps {
  successBadgeClassName: string;
  successIconWrapClassName: string;
  titleClassName: string;
  descriptionClassName: string;
  title: string;
  description: string;
}

export const OrderConfirmationHeader: React.FC<OrderConfirmationHeaderProps> = ({
  successBadgeClassName,
  successIconWrapClassName,
  titleClassName,
  descriptionClassName,
  title,
  description,
}) => {
  return (
    <div className="space-y-6">
      <div className={successBadgeClassName}>
        <div className={successIconWrapClassName}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <div className="space-y-3">
        <h1 className={titleClassName}>{title}</h1>
        <p className={descriptionClassName}>{description}</p>
      </div>
    </div>
  );
};

export default OrderConfirmationHeader;
