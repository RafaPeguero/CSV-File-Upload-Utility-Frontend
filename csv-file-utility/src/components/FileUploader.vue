<template>
    <div class="file-uploader">
      <div class="upload-container">
        <h2>Upload Sales Order Data</h2>
        <p class="instructions">
          Please upload a CSV file containing your sales order data.
          The file should include headers for: OrdnerNumber, ShipToName, ShipToAddress, ShipToCity, ShipToState, ShipToPostalCode, ShipToCountry,Sku and RequestedWarehouse
        </p>
        
        <div class="drop-zone" 
             :class="{ 'active': isDragging }"
             @dragover.prevent="isDragging = true"
             @dragleave.prevent="isDragging = false"
             @drop.prevent="handleFileDrop">
          <input type="file" 
                 ref="fileInput" 
                 @change="handleFileSelect" 
                 accept=".csv,.xlsx" 
                 class="file-input">
          <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <p>Drag and drop your file here or</p>
          <button type="button" @click="$refs.fileInput.click()" class="browse-btn">
            Browse Files
          </button>
          <p class="file-types">Accepted file types: .CSV, .XLSX</p>
        </div>
        
        <div v-if="selectedFile" class="selected-file">
          <p>Selected file: {{ selectedFile.name }}</p>
          <button @click="uploadFile" class="upload-btn" :disabled="uploading">
            Upload File
          </button>
        </div>
        
        <upload-status 
          v-if="uploading || uploadComplete" 
          :progress="uploadProgress" 
          :success="uploadSuccess" 
          :message="statusMessage"
          :error-details="errorDetails"
        />
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Papa from 'papaparse';
  import * as XLSX from 'xlsx';
  import Swal from 'sweetalert2';
  import UploadStatus from './UploadStatus.vue';
  
  export default {
    name: 'FileUploader',
    components: {
      UploadStatus
    },
    data() {
      return {
        selectedFile: null,
        isDragging: false,
        uploading: false,
        uploadComplete: false,
        uploadProgress: 0,
        uploadSuccess: false,
        statusMessage: '',
        errorDetails: ''
      };
    },
    methods: {
      handleFileDrop(e) {
        this.isDragging = false;
        const files = e.dataTransfer.files;
        if (files.length) {
          this.validateAndSetFile(files[0]);
        }
      },
      handleFileSelect(e) {
        const files = e.target.files;
        if (files.length) {
          this.validateAndSetFile(files[0]);
        }
      },
      validateAndSetFile(file) {
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        if (['csv', 'xlsx'].includes(fileExt)) {
          this.selectedFile = file;
          this.resetUploadStatus();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid File Type',
            text: 'Please upload a CSV or Excel file.'
          });
        }
      },
      resetUploadStatus() {
        this.uploading = false;
        this.uploadComplete = false;
        this.uploadProgress = 0;
        this.uploadSuccess = false;
        this.statusMessage = '';
        this.errorDetails = '';
      },
      async parseFile() {
        const fileExt = this.selectedFile.name.split('.').pop().toLowerCase();
        
        if (fileExt === 'csv') {
          return new Promise((resolve, reject) => {
            Papa.parse(this.selectedFile, {
              header: true,
              complete: (results) => {
                if (results.errors.length > 0) {
                  reject(results.errors);
                } else {
                  resolve(results.data);
                }
              },
              error: (error) => {
                reject(error);
              }
            });
          });
        } else if (fileExt === 'xlsx') {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
              } catch (error) {
                reject(error);
              }
            };
            reader.readAsArrayBuffer(this.selectedFile);
          });
        }
      },
      async uploadFile() {
        this.uploading = true;
        this.uploadProgress = 10;
        this.statusMessage = 'Parsing file...';
        
        try {
          const parsedData = await this.parseFile();
          this.uploadProgress = 30;
          this.statusMessage = 'Validating data...';
          
          const requiredFields = ['OrderNumber*', 'ShipToName*', 'ShipToAddress1*', 'ShipToCity*', 'ShipToState*', 'ShipToPostalCode*', 'ShipToCountry*', 'Sku*', 'Quantity*', 'RequestedWarehouse*'];
          const missingFields = requiredFields.filter(field => 
            !parsedData[0] || !Object.keys(parsedData[0]).some(key => 
              key.toLowerCase() === field.toLowerCase()
            )
          );
          
          if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
          }
          
          this.uploadProgress = 50;
          this.statusMessage = 'Uploading data...';
          
          const formData = new FormData();
          formData.append('file', this.selectedFile);
          
          await axios.post('http://localhost:5275/api/upload-sales-data', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 50) / progressEvent.total
              );
              this.uploadProgress = 50 + percentCompleted;
            }
          });
          
          this.uploadProgress = 100;
          this.uploadSuccess = true;
          this.statusMessage = `Successfully uploaded ${parsedData.length} records`;
          this.uploadComplete = true;
          
          Swal.fire({
            icon: 'success',
            title: 'Upload Complete',
            text: `Successfully processed ${parsedData.length} sales records.`
          });
          
        } catch (error) {
          this.uploadProgress = 100;
          this.uploadSuccess = false;
          this.uploadComplete = true;
          this.statusMessage = 'Upload failed';
          this.errorDetails = error.message || 'An unknown error occurred';
          
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: this.errorDetails
          });
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .file-uploader {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .upload-container {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .instructions {
    margin-bottom: 20px;
    color: #555;
  }
  
  .drop-zone {
    border: 2px dashed #ccc;
    border-radius: 6px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 20px;
  }
  
  .drop-zone.active {
    border-color: #4a90e2;
    background-color: rgba(74, 144, 226, 0.05);
  }
  
  .file-input {
    display: none;
  }
  
  .upload-icon {
    font-size: 48px;
    color: #aaa;
    margin-bottom: 15px;
  }
  
  .browse-btn {
    background-color: #4a90e2;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin: 10px 0;
  }
  
  .file-types {
    font-size: 0.8em;
    color: #888;
    margin-top: 10px;
  }
  
  .selected-file {
    margin-top: 20px;
    padding: 10px;
    background-color: #eee;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .upload-btn {
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .upload-btn:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
  </style>