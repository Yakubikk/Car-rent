export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Check if this is a Prisma error
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

// Handle Prisma-specific errors
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002': // Unique constraint failed
      return res.status(409).json({
        message: 'A record with this value already exists',
        field: err.meta?.target?.[0] || 'unknown'
      });
    
    case 'P2025': // Record not found
      return res.status(404).json({
        message: 'The requested resource was not found'
      });
      
    case 'P2003': // Foreign key constraint failed
      return res.status(400).json({
        message: 'Related record not found',
        field: err.meta?.field_name || 'unknown'
      });
      
    default:
      return res.status(500).json({
        message: 'Database error',
        code: err.code
      });
  }
};
