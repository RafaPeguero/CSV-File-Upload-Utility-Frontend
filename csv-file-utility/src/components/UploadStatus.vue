<template>
    <div class="upload-status">
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="status-message" :class="{ 'success': success, 'error': !success }">
        {{ message }}
        <p v-if="errorDetails" class="error-details">{{ errorDetails }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UploadStatus',
    props: {
      progress: {
        type: Number,
        required: true
      },
      success: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        default: ''
      },
      errorDetails: {
        type: String,
        default: ''
      }
    }
  };
  </script>
  
  <style scoped>
  .upload-status {
    margin-top: 20px;
  }
  
  .progress-container {
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #4a90e2;
    transition: width 0.3s ease;
  }
  
  .status-message {
    text-align: center;
    padding: 10px;
    border-radius: 4px;
  }
  
  .success {
    color: #2ecc71;
  }
  
  .error {
    color: #e74c3c;
  }
  
  .error-details {
    font-size: 0.9em;
    margin-top: 5px;
  }
  </style>