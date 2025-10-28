// Shared type definitions and constants

const EXECUTION_STATUS = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compilation Error',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded'
};

const SUPPORTED_LANGUAGES = {
  CPP: 'cpp',
  JAVA: 'java'
};

module.exports = {
  EXECUTION_STATUS,
  SUPPORTED_LANGUAGES
};