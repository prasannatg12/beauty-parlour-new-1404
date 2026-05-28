import React from 'react';

interface ScrollableTableProps {
  children: React.ReactNode; // This should be the <table> element
  maxHeight?: string; // Allows dynamic height if needed, e.g., "500px" or "calc(100vh - 300px)"
  tableTopContent?: React.ReactNode; // Content that sticks to the top, above the table (e.g., search, filters)
  tableBottomContent?: React.ReactNode; // Content that sticks to the bottom, below the table (e.g., pagination)
}

export const ScrollableTable: React.FC<ScrollableTableProps> = ({
  children,
  maxHeight = "calc(100vh - 250px)", // Default height, adjust based on your page's header/footer
  tableTopContent,
  tableBottomContent,
}) => {
  return (
    <div className="table-container shadow-sm flex flex-col overflow-hidden" style={{ maxHeight }}>
      {tableTopContent && <div className="sticky-table-top shrink-0">{tableTopContent}</div>}
      <div className="table-scroll-area flex-1 overflow-auto min-h-0">
        {children}
      </div>
      {tableBottomContent && <div className="sticky-table-bottom shrink-0">{tableBottomContent}</div>}
    </div>
  );
};