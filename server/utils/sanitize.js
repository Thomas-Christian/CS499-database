// Simple HTML sanitizer function
const sanitizeHtml = (input) => {
    if (typeof input !== 'string') {
      return input;
    }
    
    // Replace potentially dangerous HTML tags and attributes
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/onerror/gi, 'data-removed')
      .replace(/onclick/gi, 'data-removed')
      .replace(/onload/gi, 'data-removed')
      .replace(/onmouseover/gi, 'data-removed')
      .replace(/javascript:/gi, 'removed:');
  };
  
  // Middleware to sanitize request data
  const sanitizeRequest = (req, res, next) => {
    // Sanitize body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHtml(req.body[key]);
        }
      });
    }
    
    // Sanitize params
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeHtml(req.params[key]);
        }
      });
    }
    
    // Sanitize query
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeHtml(req.query[key]);
        }
      });
    }
    
    next();
  };
  
  module.exports = {
    sanitizeHtml,
    sanitizeRequest
  };